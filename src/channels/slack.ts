import fs from 'fs';
import path from 'path';

import { App, LogLevel } from '@slack/bolt';
import type {
  GenericMessageEvent,
  BotMessageEvent,
  FileShareMessageEvent,
} from '@slack/types';

import { ASSISTANT_NAME, TRIGGER_PATTERN } from '../config.js';
import { updateChatName } from '../db.js';
import { readEnvFile } from '../env.js';
import { resolveGroupFolderPath } from '../group-folder.js';
import {
  downloadToBuffer,
  isSupportedImageType,
  processImage,
} from '../image.js';
import { logger } from '../logger.js';
import { registerChannel, ChannelOpts } from './registry.js';
import {
  Channel,
  OnInboundMessage,
  OnChatMetadata,
  RegisteredGroup,
} from '../types.js';

// Slack's chat.postMessage API limits text to ~4000 characters per call.
// Messages exceeding this are split into sequential chunks.
const MAX_MESSAGE_LENGTH = 4000;

// The message subtypes we process. Bolt delivers all subtypes via app.event('message');
// we filter to regular messages (GenericMessageEvent, subtype undefined) and bot messages
// (BotMessageEvent, subtype 'bot_message') so we can track our own output.
type HandledMessageEvent = GenericMessageEvent | BotMessageEvent;

export interface SlackChannelOpts {
  onMessage: OnInboundMessage;
  onChatMetadata: OnChatMetadata;
  registeredGroups: () => Record<string, RegisteredGroup>;
}

export class SlackChannel implements Channel {
  name = 'slack';

  private app: App;
  private botToken: string;
  private botUserId: string | undefined;
  private connected = false;
  private outgoingQueue: Array<{ jid: string; text: string }> = [];
  private flushing = false;
  private userNameCache = new Map<string, string>();

  private opts: SlackChannelOpts;

  constructor(opts: SlackChannelOpts) {
    this.opts = opts;

    // Read tokens from .env (not process.env — keeps secrets off the environment
    // so they don't leak to child processes, matching NanoClaw's security pattern)
    const env = readEnvFile(['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN']);
    const botToken = env.SLACK_BOT_TOKEN;
    const appToken = env.SLACK_APP_TOKEN;
    this.botToken = botToken || '';

    if (!botToken || !appToken) {
      throw new Error(
        'SLACK_BOT_TOKEN and SLACK_APP_TOKEN must be set in .env',
      );
    }

    this.app = new App({
      token: botToken,
      appToken,
      socketMode: true,
      logLevel: LogLevel.ERROR,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Use app.event('message') instead of app.message() to capture all
    // message subtypes including bot_message (needed to track our own output)
    this.app.event('message', async ({ event }) => {
      // Bolt's event type is the full MessageEvent union (17+ subtypes).
      // We filter on subtype first, then narrow to the types we handle:
      // - undefined: regular user message (may include files)
      // - 'bot_message': our own output (tracked for self-detection)
      // - 'file_share': file-only upload (no text body)
      const subtype = (event as { subtype?: string }).subtype;
      if (subtype && subtype !== 'bot_message' && subtype !== 'file_share')
        return;

      // After filtering, event is GenericMessageEvent, BotMessageEvent, or FileShareMessageEvent
      const msg = event as HandledMessageEvent;

      // For file_share events text is often empty — that's fine, images carry the content.
      // For all other subtypes, skip if there's no text and no files.
      const hasFiles = !!(event as { files?: unknown[] }).files?.length;
      if (!msg.text && !hasFiles) return;

      // Threaded replies are flattened into the channel conversation.
      // The agent sees them alongside channel-level messages; responses
      // always go to the channel, not back into the thread.

      const jid = `slack:${msg.channel}`;
      const timestamp = new Date(parseFloat(msg.ts) * 1000).toISOString();
      const isGroup = msg.channel_type !== 'im';

      // Always report metadata for group discovery
      this.opts.onChatMetadata(jid, timestamp, undefined, 'slack', isGroup);

      // Only deliver full messages for registered groups
      const groups = this.opts.registeredGroups();
      if (!groups[jid]) return;

      const isBotMessage = !!msg.bot_id || msg.user === this.botUserId;

      let senderName: string;
      if (isBotMessage) {
        senderName = ASSISTANT_NAME;
      } else {
        senderName =
          (msg.user ? await this.resolveUserName(msg.user) : undefined) ||
          msg.user ||
          'unknown';
      }

      // Translate Slack <@UBOTID> mentions into TRIGGER_PATTERN format.
      // Slack encodes @mentions as <@U12345>, which won't match TRIGGER_PATTERN
      // (e.g., ^@<ASSISTANT_NAME>\b), so we prepend the trigger when the bot is @mentioned.
      let content = msg.text || '';
      if (this.botUserId && !isBotMessage) {
        const mentionPattern = `<@${this.botUserId}>`;
        if (
          content.includes(mentionPattern) &&
          !TRIGGER_PATTERN.test(content)
        ) {
          content = `@${ASSISTANT_NAME} ${content}`;
        }
      }

      // Download image file attachments, resize via sharp, convert to JPEG,
      // and save to the group's attachments/ directory (mounted in the container
      // at /workspace/group/attachments/).
      if (!isBotMessage && hasFiles) {
        const group = groups[jid];
        const groupDir = group ? resolveGroupFolderPath(group.folder) : null;
        if (groupDir) {
          const files =
            (
              event as {
                files?: Array<{
                  id: string;
                  mimetype: string;
                  url_private?: string;
                  name?: string | null;
                }>;
              }
            ).files || [];
          for (const file of files) {
            if (!file.url_private || !isSupportedImageType(file.mimetype))
              continue;
            try {
              const buffer = await downloadToBuffer(file.url_private, {
                Authorization: `Bearer ${this.botToken}`,
              });
              const result = await processImage(buffer, groupDir, '');
              if (result) {
                content = (content ? content + '\n' : '') + result.content;
                logger.info(
                  { fileId: file.id, path: result.relativePath },
                  'Processed image attachment',
                );
              }
            } catch (err) {
              logger.warn(
                { fileId: file.id, err },
                'Image download/processing failed',
              );
            }
          }
        }
      }

      // Skip if still nothing to deliver
      if (!content) return;

      this.opts.onMessage(jid, {
        id: msg.ts,
        chat_jid: jid,
        sender: msg.user || msg.bot_id || '',
        sender_name: senderName,
        content,
        timestamp,
        is_from_me: isBotMessage,
        is_bot_message: isBotMessage,
      });
    });
  }

  async connect(): Promise<void> {
    await this.app.start();

    // Get bot's own user ID for self-message detection.
    // Resolve this BEFORE setting connected=true so that messages arriving
    // during startup can correctly detect bot-sent messages.
    try {
      const auth = await this.app.client.auth.test();
      this.botUserId = auth.user_id as string;
      logger.info({ botUserId: this.botUserId }, 'Connected to Slack');
    } catch (err) {
      logger.warn({ err }, 'Connected to Slack but failed to get bot user ID');
    }

    this.connected = true;

    // Flush any messages queued before connection
    await this.flushOutgoingQueue();

    // Sync channel names on startup
    await this.syncChannelMetadata();
  }

  async sendMessage(jid: string, text: string): Promise<void> {
    const channelId = jid.replace(/^slack:/, '');

    if (!this.connected) {
      this.outgoingQueue.push({ jid, text });
      logger.info(
        { jid, queueSize: this.outgoingQueue.length },
        'Slack disconnected, message queued',
      );
      return;
    }

    try {
      // Slack limits messages to ~4000 characters; split if needed
      if (text.length <= MAX_MESSAGE_LENGTH) {
        await this.app.client.chat.postMessage({
          channel: channelId,
          text,
          mrkdwn: true,
        });
      } else {
        for (let i = 0; i < text.length; i += MAX_MESSAGE_LENGTH) {
          await this.app.client.chat.postMessage({
            channel: channelId,
            text: text.slice(i, i + MAX_MESSAGE_LENGTH),
            mrkdwn: true,
          });
        }
      }
      logger.info({ jid, length: text.length }, 'Slack message sent');
    } catch (err) {
      this.outgoingQueue.push({ jid, text });
      logger.warn(
        { jid, err, queueSize: this.outgoingQueue.length },
        'Failed to send Slack message, queued',
      );
    }
  }

  async sendFile(
    jid: string,
    filePath: string,
    filename?: string,
  ): Promise<void> {
    const channelId = jid.replace(/^slack:/, '');
    try {
      const buffer = fs.readFileSync(filePath);
      await this.app.client.files.uploadV2({
        channel_id: channelId,
        file: buffer,
        filename: filename ?? path.basename(filePath),
      });
      logger.info({ jid, filePath }, 'Slack file uploaded');
    } catch (err) {
      logger.error({ jid, filePath, err }, 'Failed to upload file to Slack');
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  ownsJid(jid: string): boolean {
    return jid.startsWith('slack:');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    await this.app.stop();
  }

  // Slack does not expose a typing indicator API for bots.
  // This no-op satisfies the Channel interface so the orchestrator
  // doesn't need channel-specific branching.
  async setTyping(_jid: string, _isTyping: boolean): Promise<void> {
    // no-op: Slack Bot API has no typing indicator endpoint
  }

  async addReaction(
    jid: string,
    messageId: string,
    emoji: string,
  ): Promise<void> {
    const channelId = jid.replace(/^slack:/, '');
    try {
      await this.app.client.reactions.add({
        channel: channelId,
        timestamp: messageId,
        name: emoji,
      });
    } catch (err) {
      logger.debug({ jid, messageId, emoji, err }, 'Failed to add reaction');
    }
  }

  async removeReaction(
    jid: string,
    messageId: string,
    emoji: string,
  ): Promise<void> {
    const channelId = jid.replace(/^slack:/, '');
    logger.info({ jid, messageId, emoji }, 'Removing reaction');
    try {
      const result = await this.app.client.reactions.remove({
        channel: channelId,
        timestamp: messageId,
        name: emoji,
      });
      if (!result.ok) {
        logger.warn(
          { jid, messageId, emoji, error: result.error },
          'reactions.remove returned not-ok',
        );
      } else {
        logger.info({ jid, messageId, emoji }, 'Reaction removed');
      }
    } catch (err) {
      logger.warn({ jid, messageId, emoji, err }, 'Failed to remove reaction');
    }
  }

  /**
   * Create a new Slack channel, invite users, and return its JID.
   */
  async createChannel(
    name: string,
    inviteUserIds?: string[],
  ): Promise<{ jid: string; channelId: string; name: string }> {
    const result = await this.app.client.conversations.create({
      name,
      is_private: false,
    });

    const channelId = result.channel?.id;
    const channelName = result.channel?.name;
    if (!channelId || !channelName) {
      throw new Error(
        `Failed to create Slack channel: ${result.error || 'no channel ID returned'}`,
      );
    }

    // Invite users (bot is auto-joined as creator)
    if (inviteUserIds?.length) {
      try {
        await this.app.client.conversations.invite({
          channel: channelId,
          users: inviteUserIds.join(','),
        });
      } catch (err) {
        logger.warn(
          { channelId, inviteUserIds, err },
          'Failed to invite some users to new channel',
        );
      }
    }

    const jid = `slack:${channelId}`;
    updateChatName(jid, channelName);
    logger.info({ channelId, name: channelName }, 'Slack channel created');
    return { jid, channelId, name: channelName };
  }

  /**
   * Sync channel metadata from Slack.
   * Fetches channels the bot is a member of and stores their names in the DB.
   */
  async syncChannelMetadata(): Promise<void> {
    try {
      logger.info('Syncing channel metadata from Slack...');
      let cursor: string | undefined;
      let count = 0;

      do {
        const result = await this.app.client.conversations.list({
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: 200,
          cursor,
        });

        for (const ch of result.channels || []) {
          if (ch.id && ch.name && ch.is_member) {
            updateChatName(`slack:${ch.id}`, ch.name);
            count++;
          }
        }

        cursor = result.response_metadata?.next_cursor || undefined;
      } while (cursor);

      logger.info({ count }, 'Slack channel metadata synced');
    } catch (err) {
      logger.error({ err }, 'Failed to sync Slack channel metadata');
    }
  }

  private async resolveUserName(userId: string): Promise<string | undefined> {
    if (!userId) return undefined;

    const cached = this.userNameCache.get(userId);
    if (cached) return cached;

    try {
      const result = await this.app.client.users.info({ user: userId });
      const name = result.user?.real_name || result.user?.name;
      if (name) this.userNameCache.set(userId, name);
      return name;
    } catch (err) {
      logger.debug({ userId, err }, 'Failed to resolve Slack user name');
      return undefined;
    }
  }

  private async flushOutgoingQueue(): Promise<void> {
    if (this.flushing || this.outgoingQueue.length === 0) return;
    this.flushing = true;
    try {
      logger.info(
        { count: this.outgoingQueue.length },
        'Flushing Slack outgoing queue',
      );
      while (this.outgoingQueue.length > 0) {
        const item = this.outgoingQueue.shift()!;
        const channelId = item.jid.replace(/^slack:/, '');
        await this.app.client.chat.postMessage({
          channel: channelId,
          text: item.text,
          mrkdwn: true,
        });
        logger.info(
          { jid: item.jid, length: item.text.length },
          'Queued Slack message sent',
        );
      }
    } finally {
      this.flushing = false;
    }
  }
}

registerChannel('slack', (opts: ChannelOpts) => {
  const envVars = readEnvFile(['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN']);
  if (!envVars.SLACK_BOT_TOKEN || !envVars.SLACK_APP_TOKEN) {
    logger.warn('Slack: SLACK_BOT_TOKEN or SLACK_APP_TOKEN not set');
    return null;
  }
  return new SlackChannel(opts);
});
