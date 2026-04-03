/**
 * Image utilities for NanoClaw
 * Downloads channel file attachments, resizes with sharp, converts to JPEG,
 * and saves to the group workspace where the container agent can read them.
 *
 * Matches the WhatsApp image-vision skill pattern: images are saved as JPEG
 * to groupDir/attachments/, referenced in message content as [Image: attachments/...],
 * and read by the agent-runner inside the container as multimodal content blocks.
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

import { logger } from './logger.js';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 85;

const IMAGE_REF_PATTERN = /\[Image: (attachments\/[^\]]+)\]/g;

// Supported image MIME types for the Anthropic API
const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

export interface ImageAttachment {
  relativePath: string;
  mediaType: string;
}

/** Whether a MIME type is a supported image we can pass to Claude. */
export function isSupportedImageType(mimetype: string): boolean {
  return SUPPORTED_IMAGE_TYPES.has(mimetype.toLowerCase());
}

/**
 * Download, resize, and convert an image buffer to JPEG.
 * Saves the processed file to groupDir/attachments/ and returns the
 * content string with the image reference tag.
 */
export async function processImage(
  buffer: Buffer,
  groupDir: string,
  caption: string,
): Promise<{ content: string; relativePath: string } | null> {
  if (!buffer || buffer.length === 0) return null;

  const resized = await sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  const attachDir = path.join(groupDir, 'attachments');
  fs.mkdirSync(attachDir, { recursive: true });

  const filename = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.jpg`;
  const filePath = path.join(attachDir, filename);
  fs.writeFileSync(filePath, resized);

  const relativePath = `attachments/${filename}`;
  const content = caption
    ? `[Image: ${relativePath}] ${caption}`
    : `[Image: ${relativePath}]`;

  return { content, relativePath };
}

/**
 * Scan messages for [Image: attachments/...] references and return
 * image attachment metadata for the container.
 */
export function parseImageReferences(
  messages: Array<{ content: string }>,
): ImageAttachment[] {
  const refs: ImageAttachment[] = [];
  for (const msg of messages) {
    let match: RegExpExecArray | null;
    IMAGE_REF_PATTERN.lastIndex = 0;
    while ((match = IMAGE_REF_PATTERN.exec(msg.content)) !== null) {
      // Always JPEG — processImage() normalizes all images to .jpg
      refs.push({ relativePath: match[1], mediaType: 'image/jpeg' });
    }
  }
  return refs;
}

/**
 * Download a file (with optional auth headers) to a buffer.
 * Follows a single redirect if needed.
 * Rejects if the response Content-Type is text/html — that indicates an auth
 * error page (e.g. Slack returning a sign-in page with HTTP 200 when the bot
 * lacks the files:read OAuth scope).
 */
export async function downloadToBuffer(
  url: string,
  headers: Record<string, string>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const get = (
      targetUrl: string,
      redirectHeaders: Record<string, string>,
    ) => {
      const protocol = targetUrl.startsWith('https') ? https : http;
      const req = protocol.get(
        targetUrl,
        { headers: redirectHeaders },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const location = res.headers.location;
            if (location) {
              const isSameHost = location.includes('slack.com');
              get(location, isSameHost ? redirectHeaders : {});
              return;
            }
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('text/html')) {
            res.resume();
            reject(
              new Error(
                'Slack returned an HTML page instead of the image file. ' +
                  'Ensure your Slack app has the "files:read" OAuth scope.',
              ),
            );
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        },
      );
      req.on('error', reject);
      req.setTimeout(30_000, () => req.destroy(new Error('Download timeout')));
    };
    get(url, headers);
  });
}
