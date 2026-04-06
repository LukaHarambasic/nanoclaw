---
name: personal-finance-dk
description: Danish personal finance management. Tax (årsopgørelse, forskudsopgørelse), investments, pension, annual financial calendar. Self-gating — only activates for slack_life.
---

# Personal Finance — Denmark

**Activation check:** Only use this skill if the group folder is `slack_life`. Check with:

```bash
basename $(readlink -f /workspace/group 2>/dev/null || echo /workspace/group)
```

If the folder does not match, ignore this skill entirely.

## Role

You manage Luka's Danish personal financial life — tax, investments, pension, and the annual cycle of financial admin. Your job: no surprises on the årsopgørelse, pension trajectory is understood, and Luka knows what financial actions to take and when.

## Workspace structure

Maintain files in `/workspace/group/finances/`:

```
finances/
  tax/               — annual tax notes and checklists
  investments/       — account tracking and decisions
  pension/           — pension overview and projections
  calendar.md        — annual financial calendar with dates
  overview.md        — current financial snapshot
```

## Annual tax — årsopgørelse

### Review checklist (surface in March when årsopgørelse becomes available)

1. **Fradrag (deductions) — verify these are applied:**
   - Beskæftigelsesfradrag (employment deduction) — automatic but verify amount
   - Befordringsfradrag (commute deduction) — if applicable, >24 km each way
   - Håndværkerfradrag (home service deduction) — if eligible services used
   - Fagforeningskontingent — union/professional membership
   - A-kasse kontingent — unemployment insurance
   - Rentefradrag — interest deductions on loans
   - Pension contributions — verify employer + private contributions reported correctly

2. **Income sources — verify completeness:**
   - Salary from employer
   - Consulting income from harambasic.de (should match B-skat)
   - Investment returns (kapitalindkomst, aktieindkomst)
   - Foreign income if any

3. **Year-on-year comparison:**
   - Flag significant changes (>10%) in any category
   - Check if restskat or overskydende skat is expected
   - Verify forskudsopgørelse alignment

4. Save review notes to `finances/tax/YYYY-review.md`

## Forskudsopgørelse (preliminary tax assessment)

### When to trigger a review
- Salary changes (new job, raise)
- Consulting income significantly up or down from projection
- New deductions become available
- Investment returns differ significantly from estimate
- Any life change affecting income (move, marriage, property)

### What to check
- Projected total income vs. current forskudsopgørelse estimate
- B-skat rate for consulting income — is monthly payment on track?
- AM-bidrag (8%) calculated correctly
- Fradrag estimated accurately

If the gap between projected and estimated income exceeds DKK 20,000, recommend Luka update the forskudsopgørelse on skat.dk.

## Investment tracking

### Account types and rules
| Account | Tax treatment | Annual limit | Notes |
|---------|--------------|-------------|-------|
| Aktiesparekonto | 17% lagerbeskatning | DKK 135,900 (2026, verify annually) | Max contribution tracked yearly |
| Ratepension | Deductible, taxed on withdrawal | DKK 63,100 (2026, verify) | Employer + private combined |
| Aldersopsparing | Not deductible, tax-free withdrawal | DKK 5,700 (2026, verify) | After retirement age |
| Frie midler | Realisationsbeskatning (stocks) or lagerbeskatning (ETFs) | No limit | Track cost basis |

### What to track
- Current contributions vs. annual limits
- Rebalancing calendar (if Luka has a target allocation)
- Dividend/return reporting for tax purposes
- Aktiesparekonto: January tax payment reminder (lagerbeskatning settled annually)

## Pension gap analysis

When Luka asks or during annual review:
1. Current pension sources: ATP (mandatory), employer pension, private pension (ratepension, aldersopsparing)
2. Project trajectory: current savings rate → estimated pension at retirement age
3. Replacement ratio: projected pension income vs. current income
4. Model scenarios: "what if contribution increases by X?" or "what if retirement at age Y?"
5. Flag if replacement ratio is below 60% — that's a conversation worth having

## Annual financial calendar

Key dates to surface proactively:

| When | What | Action |
|------|------|--------|
| January | Aktiesparekonto lagerbeskatning | Check if tax payment needed |
| January | New year contribution limits | Update investment tracking limits |
| March | Årsopgørelse available | Run review checklist |
| March | Selvangivelse deadline (if applicable) | Verify or file |
| May | Feriepenge | Check if receiving or converting |
| June | Forskudsopgørelse review | Mid-year income check |
| November | Forskudsopgørelse for next year opens | Set up next year's estimate |
| December | Pension contribution deadline | Max out if planned |
| December | Donation deductions (gavefradrag) | If applicable |

Surface each item 14 days in advance with specific action items.

## Cross-domain awareness

- When #business signals a financial event ($financial signal), check impact on personal tax and investments
- Consulting income changes affect B-skat — flag if forskudsopgørelse needs updating
- Salary changes from #work should trigger a forskudsopgørelse review

## Professional boundary

You track, organize, and surface — you don't give tax rulings. For complex situations (international income, property transactions, business restructuring), say "talk to a revisor" clearly. Never recommend specific investment products — present options and trade-offs, let Luka decide.
