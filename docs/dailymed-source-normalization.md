# DailyMed source normalization policy

OpenRxCore treats **DailyMed source records as labeler/product/SPL-specific** unless a future **human-reviewed** policy explicitly states otherwise.

See also: [dailymed-pilot.md](dailymed-pilot.md) · [evidence-model.md](evidence-model.md) · [citation-policy.md](citation-policy.md)

**OpenRxCore is not clinically usable.** This policy governs metadata scoping only. It does not authorize clinical synthesis from DailyMed metadata alone.

## Core principles

1. **DailyMed labels are labeler/product/SPL-specific.** Each SPL reflects labeling submitted for a particular product and labeler.
2. **`setid` is the key identifier** for a specific SPL source in OpenRxCore.
3. **Generic drug queries may return many SPLs** from different labelers/manufacturers.
4. **First search result is not canonical.** API sort position must not be used as a long-term import pattern.
5. **Do not infer a whole-drug label from one SPL.** A single SPL must not represent “the cefazolin label” or any generic drug label generally.
6. **Source titles must scope to labeler/product identity** when available (or state `labeler unknown`).
7. **`known_gaps` must disclose** when only one SPL has been evaluated for a generic drug.
8. **`reuse_status` stays conservative** (`unknown_requires_review` by default) until human/legal review documents reuse rights.
9. **No canonical labeler-selection policy is created in this branch.** Future work may choose multiple SPLs per drug, a canonical reference SPL, or multi-source comparison — after human review.

## Source record requirements (`dailymed_label`)

| Requirement | Rule |
|-------------|------|
| `identifiers.setid` | Required |
| `source_title` | Must include `identifiers.labeler` when present; otherwise must include `labeler unknown` |
| `source_origin` | `DailyMed` |
| `source_authority_level` | `regulatory_label` |
| `reuse_status` | Default `unknown_requires_review`; `public_domain` only with verifiable `license_note` basis |
| `notes` / `known_gaps` | Disclose single-SPL limitation for generic drugs when applicable |

Validation enforces these rules in `scripts/lib/evidence-rules.js`.

## Fetch tooling (metadata only)

Script: `scripts/fetch-dailymed-single-drug.js`

| Mode | Command | Output |
|------|---------|--------|
| **list** | `npm run fetch:dailymed:cefazolin:list` | `data/raw/dailymed/cefazolin/search-candidates.json` |
| **fetch** | `npm run fetch:dailymed:cefazolin` | `data/raw/dailymed/cefazolin/fetch-metadata.json` |

- **list** writes a capped metadata sample (max 25 candidates) plus `total_results`.
- **fetch** requires an **explicit `setid`** (pilot default preserved via script constant / `DAILYMED_SETID`).
- **No label XML/HTML/body text** is stored.
- **No unattended or scheduled execution.**

`result_position` in candidate lists reflects API sort order only — **not** canonical ranking.

## Cefazolin pilot reference SPL

The merged pilot preserved one explicit SPL:

- **Labeler:** WG Critical Care, LLC
- **setid:** `1999084a-124c-45f9-801f-416a1b942c96`
- **Not canonical** for cefazolin generally; other labeler SPLs were not evaluated

## What this branch does not do

- Select a canonical reference labeler for generic drugs
- Import multiple SPLs per drug into `evidence.yaml`
- Create clinical synthesis, monograph content, or approved evidence packets
- Expand DailyMed imports to other OPAT drugs
- Assert reuse rights beyond conservative defaults

## Future work (deferred)

Documented for `feature/dailymed-expand-opat-source-metadata` and later:

- Whether to store multiple SPLs per generic drug
- Whether to designate a human-reviewed canonical reference SPL
- Normalized multi-source comparison workflows
- Human/legal review of `reuse_status` and `license_note` on concrete examples

## Prohibited sources

Do not use proprietary subscription references or copy proprietary editorial synthesis. DailyMed metadata may inform source records; clinical wording must remain original and human-reviewed before publication.
