# OpenRxCore schemas

JSON schemas for medication knowledge content and agent outputs. See `scripts/validate.js` for enforcement rules.

For the conceptual evidence model and citation rules, see [docs/evidence-model.md](../docs/evidence-model.md) and [docs/citation-policy.md](../docs/citation-policy.md).

## Monograph fields (`monograph.schema.json`)

| Field | Type | Notes |
|-------|------|-------|
| `drug_id` | string | Stable folder identifier |
| `generic_name` | string | Generic drug name |
| `brand_names` | string[] | Brand names (may be empty in scaffold) |
| `rxcui` | string[] | RxNorm RxCUI placeholders |
| `routes` | string[] | Route placeholders |
| `drug_class` | string | High-level class metadata |
| `domain_tags` | string[] | e.g. `opat`, `infectious_diseases` |
| `publication_status` | enum | `draft`, `published`, `retired` |
| `review_status` | enum | See CONTRIBUTING.md |
| `review_level` | enum | See CONTRIBUTING.md |
| `last_reviewed` | date \| null | Required for published monographs |
| `next_review_due` | date \| null | Optional scheduling metadata |
| `clinically_usable` | boolean | **Scaffold safety flag.** Must be `false`; schema enforces `const: false` and validation rejects `true` |
| `PLACEHOLDER_CLINICAL_CONTENT` | boolean | Must be `false` before publication |
| `known_gaps` | string[] | Documented content gaps |
| `evidence_source_ids` | string[] | Required for published monographs |
| `require_citations_for_clinical_claims` | boolean | Citation policy flag |
| `sections` | object[] | Optional structured sections with citation rules |
| `files` | object | References to patient, clinician, evidence, changelog files |
| `reviewers` | object[] | Reviewer metadata (required for published) |
| `conflicts_of_interest` | string[] | COI declarations |
| `changelog_version` | string | Optional version tag |
| `notes` | string | Optional free-text notes |

## Other schemas

- `evidence.schema.json` — evidence file v1.0: sources, citations, evidence packets (see `docs/evidence-model.md`)
- `reviewer.schema.json` — reviewer metadata records
- `changelog.schema.json` — changelog entry structure
- `agent-output.schema.json` — shared agent output envelope

## Evidence file (`evidence.schema.json` v1.0)

Top-level fields: `schema_version`, `drug_id`, `evidence_status`, `last_evidence_reviewed`, `sources`, `citations`, `evidence_packets`, `known_gaps`, `audit_notes`.

Citation IDs: `{drug_id}-cite-{####}`. Packet IDs: `{drug_id}-packet-{####}`.

See [docs/evidence-model.md](../docs/evidence-model.md) and [docs/citation-policy.md](../docs/citation-policy.md).
