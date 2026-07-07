# OpenRxCore evidence model

This document describes the `evidence.yaml` structure (schema version **1.0**) used by OpenRxCore drug folders. OpenRxCore is **not clinically usable** in its current state. Evidence packets are infrastructure for future human-reviewed monographs — not automatically published recommendations.

See also: [citation-policy.md](citation-policy.md) · [schema/README.md](../schema/README.md) (field definitions)

## Overview

The evidence model separates:

1. **Source records** — where information came from
2. **Citation records** — precise pointers into sources
3. **Evidence packets** — structured claim units for review
4. **Clinical claims** — optional text requiring citations and human review
5. **Review status** — workflow state at file and packet level
6. **Reuse/license status** — what may be cited, quoted, or derived
7. **Human approval status** — packet-level review gates
8. **Known gaps and uncertainty** — explicit limits and flags

## Top-level `evidence.yaml` structure

| Field | Required | Description |
|-------|----------|-------------|
| `schema_version` | yes | Must be `"1.0"` for this branch |
| `drug_id` | yes | Must match the drug folder name |
| `evidence_status` | yes | Workflow state for the evidence file |
| `last_evidence_reviewed` | no | Date of last evidence review |
| `sources` | yes | Array of source records (may be empty in scaffold) |
| `citations` | yes | Array of citation records |
| `evidence_packets` | yes | Array of evidence packets |
| `known_gaps` | yes | Documented evidence gaps (minimum one entry) |
| `audit_notes` | no | Maintainer or audit notes |

### `evidence_status` values

- `not_imported` — scaffold / no sources imported yet
- `sources_imported` — sources recorded, packets may be pending
- `evidence_packets_drafted` — packets drafted, not yet reviewed
- `needs_review` — awaiting human review
- `approved` — evidence file approved under project governance
- `retired` — evidence file retired

Placeholder drug folders in this repository use `not_imported` with empty `sources`, `citations`, and `evidence_packets`.

### `schema_version` and migrations

Increment `schema_version` in a dedicated branch when the `evidence.yaml` top-level structure or required fields change. Validation enforces the active version (`"1.0"` currently). Future importers and migration scripts should key off this field.

**Cross-drug source deduplication is intentionally deferred** to a later task. Each drug folder owns its `evidence.yaml` source list for now, even if multiple drugs share the same public source. Before scaling beyond the initial OPAT set, maintainers should plan a shared source registry (tracked as future work — not implemented in this branch).

## Source records

Source records describe public/open provenance.

Key fields:

- `source_id` — stable identifier unique within the evidence file
- `source_type` — closed enum (e.g. `dailymed_label`, `rxnorm`, `pmc_open_access`)
- `source_title`, `source_url`, `source_origin`, `source_publisher`
- `source_date`, `accessed_date`, `updated_date`
- `identifiers` — key/value public identifiers (RxCUI, NDA, PMID, etc.)
- `reuse_status` — what reuse is permitted
- `license_note` — **required** for `pmc_open_access` and `open_guideline`
- `source_authority_level` — evidentiary weight category
- `source_status` — whether the source is active, superseded, etc.
- `notes` — free text; for `human_synthesis`, must include author/reviewer metadata in `notes` **or** be marked `source_status: pending_review` (validation enforces this; `pending_review` is the required enum value when attribution is not yet recorded — there is no separate `needs_review` source status)

### Reuse/license status

| Value | Meaning |
|-------|---------|
| `public_domain` | Reuse permitted broadly |
| `open_license` | Reuse permitted under stated open license (`license_note`) |
| `metadata_only` | Identity/metadata citation only |
| `citation_only` | May be cited as metadata; **no reusable derived wording** |
| `restricted_no_reuse` | **Cannot support reusable generated content** |
| `unknown_requires_review` | **Cannot support approved evidence packets** |

Validation enforces these rules for approved packets and packets with reusable candidate text.

## Citation records

Citations link evidence packets to sources with locators.

- `citation_id` — format: `{drug_id}-cite-{####}` (e.g. `exampledrug-cite-0001`)
- `source_id` — must exist in `sources`
- `citation_label`, `locator` — human- and machine-readable pointers
- `citation_type` — granularity (section, paragraph, registry record, etc.)
- `supports_claim_type` — how the citation relates to a claim
- `reuse_note`, `notes`

See [citation-policy.md](citation-policy.md) for ID format and when citations are required.

## Evidence packets

Evidence packets are the unit of review between raw sources and monograph sections.

- `packet_id` — format: `{drug_id}-packet-{####}`
- `packet_type` — closed enum (e.g. `indication`, `warning_or_precaution`, `knowledge_gap`)
- `packet_status` — `draft`, `needs_review`, `needs_revision`, `approved`, `rejected`, `retired`
- `affected_monograph_sections` — monograph section IDs this packet may inform
- `claim_summary` — short neutral summary for reviewers
- `clinical_claim` — optional; **if non-empty, requires `citation_ids` and human review unless `packet_status` is `approved`**
- `patient_facing_candidate`, `clinician_facing_candidate` — **draft candidates only; not published content**
- `citation_ids`, `source_ids` — must reference records in the same file
- `recommendation_impact` — `none`, `possible`, `direct`, `unknown_requires_review`
- `requires_human_review`, `review_level`
- `uncertainty_flags` — closed enum list
- `known_gaps`, `reviewer_notes`
- `created_by`, `created_date`, `last_updated`

### Clinical claim rules

- `clinical_claim` may be empty or null in placeholders.
- Any **non-empty** `clinical_claim` must have at least one `citation_id`.
- Any non-empty `clinical_claim` must have `requires_human_review: true` unless `packet_status` is `approved`.
- `recommendation_impact: direct` requires `review_level` of `level_3_recommendation_impacting` or `level_4_specialty_high_risk`.

Evidence packets **do not automatically become monograph recommendations**. Human reviewers must approve packets and monograph publication separately.

## Relationship to monographs

```
sources ──► citations ──► evidence_packets ──► (human review) ──► monograph sections
                              │
                              └── patient.md / clinician.md candidates (draft only)
```

`monograph.yaml` references evidence via `evidence_source_ids` and file pointers. Future workflows will map approved packets to monograph sections. In this branch, drug monographs remain placeholders.

## Human review requirements

- AI-assisted extraction may propose packets with `requires_human_review: true`.
- Packets with clinical claims cannot bypass review except when explicitly `approved` by human reviewers.
- `evidence_status: approved` at the file level is a governance decision distinct from individual packet approval.
- Patient-facing and clinician-facing candidate fields are drafts until monograph review and publication gates pass.

## Uncertainty and known gaps

Use:

- top-level `known_gaps` for file-wide evidence limitations
- packet-level `known_gaps` for claim-specific limits
- `uncertainty_flags` for structured uncertainty (conflicting sources, outdated sources, license unclear, etc.)
- `audit_notes` for maintainer audit commentary

Do not silently resolve conflicting evidence. Flag `conflicting_sources` or `requires_human_interpretation` and escalate to human review.

## Fictional examples

Illustrative records live in `fixtures/evidence/` using `drug_id: exampledrug` and `FICTIONAL EXAMPLE — NOT REAL CLINICAL DATA` markers. They are **not** clinical guidance.

Valid illustration: `fixtures/evidence/valid-example.yaml`

## Prohibited sources

Do not import or structure content from proprietary subscription references (Lexicomp, Micromedex, Sanford Guide, UpToDate, DynaMed, commercial drug databases). Use public/open sources listed in project policy only.
