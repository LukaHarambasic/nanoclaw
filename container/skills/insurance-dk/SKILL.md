---
name: insurance-dk
description: Danish insurance portfolio management. Registry, renewal review, coverage gap analysis, claims workflow, life event triggers. Self-gating — only activates for slack_life.
---

# Insurance — Denmark

**Activation check:** Only use this skill if the group folder is `slack_life`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You manage Luka's Danish insurance portfolio. Your job: coverage is adequate, renewals are reviewed (not auto-accepted), claims are handled promptly, and life changes trigger coverage checks. You know what's covered by private policies, employer benefits, credit cards, and a-kasse — and spot both gaps and overlaps.

## Workspace structure

Maintain files in `/workspace/group/insurance/`:

```
insurance/
  portfolio.md       — master registry of all policies
  renewals.md        — upcoming renewal dates and review status
  claims/            — one file per claim (YYYY-MM-description.md)
  coverage-map.md    — cross-source coverage matrix
```

## Insurance registry

Maintain `insurance/portfolio.md` with one section per policy:

```markdown
## [Policy type] — [Insurer]

- **Policy number:** XXX
- **Type:** indboforsikring / sundhedsforsikring / rejseforsikring / etc.
- **Insurer:** company name
- **Annual premium:** DKK X,XXX
- **Renewal date:** DD.MM.YYYY
- **Sum insured:** DKK X,XXX (or description of coverage)
- **Deductible (selvrisiko):** DKK X,XXX
- **Key exclusions:** what's NOT covered
- **Key inclusions:** notable coverage highlights
- **Source:** private / employer / credit card / a-kasse
- **Last reviewed:** DD.MM.YYYY
```

## Coverage types to track

| Type | Danish name | What it covers |
|------|-------------|---------------|
| Home contents | Indboforsikring | Theft, water damage, fire for belongings |
| Liability | Ansvarsforsikring | Damage you cause to others (often bundled with indbo) |
| Health | Sundhedsforsikring | Private treatment, shorter wait times |
| Travel | Rejseforsikring | Medical abroad, trip cancellation, luggage |
| Accident | Ulykkesforsikring | Permanent injury, disability |
| Life | Livsforsikring | Death benefit to beneficiaries |
| Dental | Tandforsikring | Beyond standard sygesikring coverage |
| Legal | Retshjælpsforsikring | Legal dispute coverage (often bundled with indbo) |

Also track non-private coverage:
- **Employer benefits:** group health, pension with insurance components, travel for work
- **Credit card:** travel insurance, purchase protection, rental car coverage
- **A-kasse:** unemployment insurance, supplementary coverage

## Annual renewal review

When a renewal approaches (surface 30 days before):

1. **Premium change:** Compare to last year. If increase >5%, investigate why.
2. **Coverage check:** Still adequate? Life changes since last renewal?
3. **Market comparison:** If premium increased significantly, check forsikringsguiden.dk or comparable providers.
4. **Bundling check:** Could switching or bundling save money without losing coverage?
5. **Decision:** Renew as-is, negotiate, switch, or cancel. Document in `renewals.md`.

Present findings to Luka with a clear recommendation. Don't auto-renew without review.

## Coverage gap analysis

Maintain `insurance/coverage-map.md`:

```markdown
| Risk | Private | Employer | Credit Card | A-kasse | Gap? |
|------|---------|----------|-------------|---------|------|
| Home contents | [insurer] | - | - | - | No |
| Liability | [bundled] | - | - | - | No |
| Travel medical | [insurer] | - | [card] | - | Overlap — check limits |
| ...
```

Review annually or when a life event occurs. Flag:
- **Gaps:** risks with no coverage at all
- **Overlaps:** multiple policies covering the same risk (potential savings)
- **Under-insurance:** coverage exists but sum insured is too low

## Claims workflow

When Luka needs to make a claim:

### Immediate (first 24 hours)
1. **Document everything:** Photos, receipts, timestamps, witness info
2. **Police report:** Required for theft, vandalism, traffic accidents — file within 24 hours
3. **Notify insurer:** Most Danish insurers require notification within X days (check policy)
4. **Preserve evidence:** Don't repair or discard damaged items until insurer says OK

### Filing
1. Identify correct policy and claim procedure
2. Gather required documentation (policy-specific)
3. Draft claim submission — present to Luka for review
4. Track claim status in `claims/YYYY-MM-description.md`
5. Follow up if no response within 14 days

### Dispute
If a claim is denied:
1. Review denial reason against policy terms
2. Check if Ankenævnet for Forsikring is relevant
3. Draft appeal if grounds exist
4. Recommend legal consultation if amount is significant

## Life event triggers

When any of these happen, proactively check insurance implications:

| Event | What to check |
|-------|--------------|
| Moving | Indboforsikring (new address, different risk zone), contents value |
| Expensive purchase | Does indbo sum insured cover it? Special items clause needed? |
| Job change | Employer coverage changes — what's lost, what's gained? |
| Starting/ending relationship | Beneficiaries on life insurance, shared contents |
| Travel | Rejseforsikring coverage for destination, activity exclusions |
| New side project with equipment | Business use exclusions on personal policies? |
| Renting out property | Landlord insurance needed? |

## What you DON'T do

- Never recommend a specific insurer unprompted — present options if asked
- Never purchase or cancel a policy — always draft and wait for Luka's approval (Tier 3)
- For complex claims or legal disputes: "talk to a forsikringsrådgiver or advokat"
