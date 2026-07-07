# DailyMed single-drug evidence pilot (cefazolin)

This document describes the first controlled real-source evidence pilot for OpenRxCore. **OpenRxCore is not clinically usable.** This pilot does not create clinical guidance.

See also: [evidence-model.md](evidence-model.md) · [citation-policy.md](citation-policy.md)

## Purpose

Prove that a **public DailyMed source** can be identified, documented, and mapped into `evidence.yaml` **without** being treated as approved clinical guidance.

Scope:

- **Drug:** cefazolin only
- **Source family:** DailyMed only
- **Output:** metadata-level source records, citations, and unapproved evidence packets

## Source used

| Field | Value |
|-------|-------|
| API | DailyMed v2 SPL search (`/dailymed/services/v2/spls.json`) |
| Search | `drug_name=cefazolin`, `pagesize=1` (single record pilot) |
| Selected setid | `1999084a-124c-45f9-801f-416a1b942c96` |
| Title | CEFAZOLIN INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC] |
| SPL version | 11 |
| Published date | 2026-07-06 (API metadata) |
| DailyMed URL | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1999084a-124c-45f9-801f-416a1b942c96 |

Raw fetch output (metadata only): `data/raw/dailymed/cefazolin/fetch-metadata.json`

Fetch script: `scripts/fetch-dailymed-single-drug.js`

```bash
npm run fetch:dailymed:cefazolin
```

## What was imported or mapped

Into `content/drugs/cefazolin/evidence.yaml`:

- `evidence_status: evidence_packets_drafted`
- **1** DailyMed source record (`cefazolin-src-dailymed-0001`)
- **2** citation records (source-level and section-level pointers)
- **2** evidence packets (`needs_review`, `requires_human_review: true`)
  - DailyMed label source identified
  - Label sections noted as available for future review (no text imported)

## What was intentionally not imported

- Full SPL XML, HTML, or PDF label documents
- Long copied label excerpts or section text
- Dosing, monitoring, safety, efficacy, or counseling claims
- `patient_facing_candidate` or `clinician_facing_candidate` text
- Updates to `patient.md` or `clinician.md`
- Bulk search across all cefazolin labels (only `pagesize=1`)
- Other drugs or non-DailyMed sources
- `approved` packet or evidence file status

## Why no clinical recommendations were generated

DailyMed labels are regulatory source material. This pilot records **source identity and availability** only. Transforming label content into clinician or patient guidance requires human review, reuse/license assessment, and a separate drafting workflow — none of which exist in this branch.

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

- Only one SPL record selected (`pagesize=1`); other manufacturers/formulations not evaluated
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

Before adding more drugs or sources:

1. Human review of pilot packets and reuse assumptions
2. Decide whether to import additional SPL records or section metadata
3. Normalize source ID conventions and fetch workflow
4. Establish reviewer workflow before any `approved` status
5. Plan cross-drug source registry before scaling beyond initial OPAT set

Do not expand to patient/clinician monograph content until explicit review gates exist.
