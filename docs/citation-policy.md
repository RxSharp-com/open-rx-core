# Citation policy

OpenRxCore links clinically meaningful content to **public/open sources** through structured citation IDs. This policy applies to `evidence.yaml`, monograph sections, and agent outputs.

See also: [evidence-model.md](evidence-model.md) · [schema/README.md](../schema/README.md) (field definitions)

## Citation ID format

```
{drug_id}-cite-{four_digit_number}
```

Examples:

- `exampledrug-cite-0001`
- `cefazolin-cite-0042`

Rules:

- `drug_id` must match the drug folder / evidence file `drug_id`
- Four-digit zero-padded sequence number (`0001`–`9999`)
- Citation IDs must be **unique within** an `evidence.yaml` file
- Validation rejects malformed IDs

## Packet ID format

```
{drug_id}-packet-{four_digit_number}
```

Example: `exampledrug-packet-0001`

Packet IDs must be unique within the evidence file.

## Source ID expectations

- `source_id` is a stable string unique within the evidence file
- Every `citation.source_id` must reference an existing source record
- Every `evidence_packet.source_ids` entry must reference an existing source record
- Cross-drug deduplication of sources is **deferred**; reuse the same `source_id` string in each drug file if needed until a shared source registry exists

Prefer descriptive IDs tied to public identifiers when known, e.g. `cefazolin-dailymed-spl-placeholder` — but avoid implying clinical content is imported when it is not.

## When a citation is required

A citation is required when content is **clinically meaningful**, including:

- non-empty `clinical_claim` in an evidence packet
- monograph `sections` with `clinical_recommendation: true`
- agent outputs with `clinical_recommendation: true`

Clinically meaningful content includes statements that could influence prescribing, dosing, monitoring, safety warnings, efficacy expectations, or patient counseling — even as drafts.

**Metadata-only** identity mappings may use `supports_claim_type: source_identity_only` with `metadata_only` or `citation_only` sources when no clinical claim is asserted.

## Citation-only and metadata-only sources

| `reuse_status` | Citation allowed | Reusable derived text allowed |
|----------------|------------------|-------------------------------|
| `metadata_only` | yes (identity/metadata) | no |
| `citation_only` | yes (pointer/metadata) | **no** |
| `restricted_no_reuse` | audit pointer only | **no** |
| `unknown_requires_review` | provisional | **no approved packets** |

Validation blocks:

- reusable packet text (`clinical_claim`, `patient_facing_candidate`, `clinician_facing_candidate`) backed by `restricted_no_reuse` or `citation_only` sources
- `approved` packets referencing `unknown_requires_review` sources

## Open-access licensing

For `pmc_open_access` and `open_guideline` sources:

- `license_note` is **required**
- record license name, version, and reuse constraints
- use `uncertainty_flags: license_unclear` when terms are ambiguous
- do not copy full text unless license explicitly permits reusable derivation

## Human synthesis sources

`human_synthesis` sources must include author or reviewer attribution in `notes`, **or** be marked `source_status: pending_review`. Validation rejects unattributed `human_synthesis` records with any other `source_status`. Use `pending_review` — not packet-level `needs_review` — when attribution is not yet recorded.

## Conflicting evidence

When sources disagree:

1. Do not silently choose a winner
2. Create separate packets or citations with `supports_claim_type: conflicting_evidence` where appropriate
3. Add `uncertainty_flags: conflicting_sources`
4. Set `requires_human_review: true`
5. Document the conflict in `known_gaps` or `reviewer_notes`

## Proprietary references

**Prohibited** as sources or citation targets:

- Lexicomp / Lexidrug
- Micromedex
- Sanford Guide
- UpToDate
- DynaMed
- commercial drug databases
- paywalled guideline text without explicit reusable license

Facts from public sources may inform human-authored synthesis. **Wording, table structure, recommendation framing, and proprietary editorial synthesis must be original.**

## Fictional examples

Documentation and fixtures use `drug_id: exampledrug` and explicit markers:

> **FICTIONAL EXAMPLE — NOT REAL CLINICAL DATA**

Examples in this branch are **not** imported or reviewed evidence. Real citations for initial OPAT drugs will be added in later import branches (e.g. `feature/dailymed-single-drug-evidence-pilot`) after human review.

Valid fictional example: `fixtures/evidence/valid-example.yaml`

Failure fixtures (for validation tests):

- `fixtures/evidence/failure-clinical-claim-without-citation.yaml`
- `fixtures/evidence/failure-citation-missing-source.yaml`
- `fixtures/evidence/failure-approved-unknown-reuse.yaml`

## Human review

Citations support auditability; they do not replace human review. All AI-proposed citations and claims require reviewer verification before packet approval or monograph publication.
