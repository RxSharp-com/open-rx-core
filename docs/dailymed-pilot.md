# DailyMed single-drug evidence pilot (cefazolin)

This document describes the first controlled real-source evidence pilot for OpenRxCore. **OpenRxCore is not clinically usable.** This pilot does not create clinical guidance.

See also: [evidence-model.md](evidence-model.md) · [citation-policy.md](citation-policy.md)

## Purpose

Prove that a **public DailyMed source** can be identified, documented, and mapped into `evidence.yaml` **without** being treated as approved clinical guidance.

Scope:

- **Drug:** cefazolin only
- **Source family:** DailyMed only
- **Output:** metadata-level source records, citations, and unapproved evidence packets

## Generic Drug / Multiple Labeler Limitation

DailyMed labels are submitted **per labeler, product, and SPL**. A generic drug such as cefazolin may have **multiple DailyMed SPLs** from different labelers/manufacturers.

This pilot selected **one DailyMed search result only**:

- **Selected SPL:** WG Critical Care, LLC cefazolin injection label (SPL version 11)
- **setid:** `1999084a-124c-45f9-801f-416a1b942c96`
- **Selection method:** first result from `drug_name=cefazolin` search with `pagesize=1` (API sort order at fetch time)
- **Not evaluated:** other cefazolin SPLs from other labelers/manufacturers (41 total SPLs reported by the API at pilot fetch time)

This source must be treated as a **single-labeler pilot source**, not as the canonical cefazolin label. `cefazolin-src-dailymed-0001` refers to the selected WG Critical Care, LLC SPL only.

Future work must define a **DailyMed source selection and normalization policy** before expanding this pattern to additional drugs or treating DailyMed label evidence as representative. That policy is deferred to `feature/dailymed-pilot-review-and-normalization`.

## Source used

| Field | Value |
|-------|-------|
| API | DailyMed v2 SPL search (`/dailymed/services/v2/spls.json`) |
| Search | `drug_name=cefazolin`, `pagesize=1` (**first search result only**) |
| Total SPLs (API) | 41 at pilot fetch time (others not imported) |
| Selected setid | `1999084a-124c-45f9-801f-416a1b942c96` |
| Labeler | WG Critical Care, LLC |
| Title (API) | CEFAZOLIN INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC] |
| SPL version | 11 |
| Published date | 2026-07-06 (API metadata) |
| DailyMed URL | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1999084a-124c-45f9-801f-416a1b942c96 |

### Raw fetch file (`fetch-metadata.json`)

Path: `data/raw/dailymed/cefazolin/fetch-metadata.json`

**Metadata only** (~1 KB). Contains:

- `source_family`, `search_query`, `selected_result_position`, `selection_method`, `selection_warning`, `search_total_elements`
- `api_search_url`, `api_verify_url`, `accessed_date`, `fetched_at`
- `selected_spl`: `setid`, `title`, `spl_version`, `published_date`, `published_date_iso`, `dailymed_url`

Does **not** contain: SPL XML/HTML, label section text, dosing tables, or bulk search results.

Fetch script: `scripts/fetch-dailymed-single-drug.js`

```bash
npm run fetch:dailymed:cefazolin
```

**Note:** The npm command fetches by **first search-result position**, not a predetermined canonical setid. Re-running may return a different labeler if API sort order changes.

## What was imported or mapped

Into `content/drugs/cefazolin/evidence.yaml`:

- `evidence_status: sources_imported` (not `evidence_packets_drafted` — multi-labeler selection unresolved; packets are metadata stubs only)
- **1** DailyMed source record for **WG Critical Care, LLC** (`cefazolin-src-dailymed-0001`)
- **2** citation records (source-level and section-level pointers for this labeler SPL)
- **2** evidence packets (`needs_review`, `requires_human_review: true`, manufacturer-scoped summaries)

## What was intentionally not imported

- Full SPL XML, HTML, or PDF label documents
- Long copied label excerpts or section text
- Dosing, monitoring, safety, efficacy, or counseling claims
- `patient_facing_candidate` or `clinician_facing_candidate` text
- Updates to `patient.md` or `clinician.md`
- Other labeler SPLs (only `pagesize=1` first result)
- Other drugs or non-DailyMed sources
- `approved` packet or evidence file status

## Why no clinical recommendations were generated

DailyMed labels are regulatory source material. This pilot records **one labeler SPL identity and availability** only. Transforming label content into clinician or patient guidance requires human review, reuse/license assessment, labeler-selection policy, and a separate drafting workflow — none of which exist in this branch.

## Human review and approval gates

- All packets: `packet_status: needs_review`, `requires_human_review: true`
- No packet or source is marked human-approved
- `last_evidence_reviewed` remains null
- `reuse_status: unknown_requires_review` on the DailyMed source

## Reuse and license uncertainty

Default: **`reuse_status: unknown_requires_review`**.

DailyMed is a public NLM resource for FDA-submitted labeling, but **label text reuse for generated clinical content is not asserted** in this pilot. The `license_note` on the source record documents that human and legal review is required before any reusable derivation.

Do not treat this pilot as a legal conclusion about reuse rights. Only `public_domain` may be used when a specific verifiable basis is documented in `license_note`.

## Limitations of a single DailyMed source

- **Multiple labelers:** generic cefazolin has many SPLs; only one labeler imported
- **Non-deterministic selection:** `pagesize=1` first result is not a canonical reference
- No section-level extraction or clinical synthesis
- No cross-validation with openFDA, RxNorm, or literature
- No human reviewer attestation
- Cross-drug source deduplication not implemented

## Validation guards (pilot phase)

`npm run validate` enforces, among other rules:

- no `approved` packets during the pilot phase
- no `patient_facing_candidate` or `clinician_facing_candidate` text
- `claim_summary` and related fields capped at 320 characters (copied-label guard)
- `recommendation_impact: direct` requires level_3 or level_4 review level
- approved packets cannot use `unknown_requires_review` sources

Failure demos: `npm run validate:evidence-failure-demo`

## Next steps before expanding

Recommended branch: **`feature/dailymed-pilot-review-and-normalization`**

Resolve **before** repeating this pattern on other OPAT drugs:

1. **Multi-labeler policy** — canonical reference labeler vs. multiple source records per generic drug
2. Human/legal review of `reuse_status` and `license_note` on this concrete example
3. Whether to import additional SPL records or section metadata for cefazolin
4. Normalize fetch workflow (explicit setid vs. search-position selection)
5. Establish reviewer workflow before any `approved` status

Do not expand to patient/clinician monograph content until explicit review gates exist.
