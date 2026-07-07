# Contributing to OpenRxCore

Thank you for contributing to OpenRxCore. This project is designed first for **contributors and builders** who want transparent, citation-linked, version-controlled medication knowledge infrastructure.

**Important:** OpenRxCore is currently an early scaffold and is **not for clinical use**. Do not add clinical recommendations, dosing guidance, or patient counseling content without an approved human review workflow.

## Who this project is for

- pharmacists, clinicians, and clinical educators
- informatics professionals and open-source developers
- public health contributors
- teams building medication education or clinical knowledge tools

Secondary consumers may include clinicians, trainees, educators, healthcare organizations, and open-source health projects integrating reviewed content.

## Before you contribute

1. Read [README.md](README.md) for positioning, safety boundaries, and source policy.
2. Do **not** use proprietary subscription references as sources.
3. Treat all clinical content as requiring human review before publication.
4. Run `npm run validate` before opening a pull request.

## Adding a drug folder

Create a new directory under `content/drugs/<drug_id>/` with:

| File | Purpose |
|------|---------|
| `monograph.yaml` | Metadata, review status, file references, known gaps |
| `patient.md` | Patient-facing monograph (plain language, reviewed before publication) |
| `clinician.md` | Clinician-facing monograph |
| `evidence.yaml` | Structured evidence packet |
| `changelog.md` | Version history |

### Scaffold placeholder requirements

For new placeholder monographs:

- set `PLACEHOLDER_CLINICAL_CONTENT: true` in `monograph.yaml`
- set `clinically_usable: false`
- set `publication_status: draft` and `review_status: not_started` (or another non-published status)
- include `[CLINICAL REVIEW REQUIRED — NOT YET DRAFTED]` in `patient.md` and `clinician.md` until drafted
- do not add drug-specific clinical claims in the initial scaffold

Validate against `schema/monograph.schema.json` and `schema/evidence.schema.json`.

## Adding evidence sources

Add sources to `evidence.yaml` under `sources[]`. Each source should include:

- `source_id` (stable identifier)
- `source_type` (from allowed types in the evidence schema)
- `title`
- `retrieved_at`
- `url` when available
- `license_notes` when reuse terms matter

Extracted claims must include `citation_ids`. Claims marked `clinical_recommendation: true` require citations and human review.

**Allowed:** DailyMed, openFDA, RxNorm, PubMed metadata, PMC open-access (when permitted), ClinicalTrials.gov, FDA/CDC/NIH public materials, open guidelines with reusable licenses, original human synthesis from public facts.

**Prohibited:** Lexicomp, Micromedex, Sanford Guide, UpToDate, DynaMed, commercial databases, paywalled text without explicit reuse permission, institutional subscription content.

## Review status and publication

### Review status values

Use only:

- `not_started`
- `source_imported`
- `ai_drafted`
- `needs_clinical_review`
- `needs_revision`
- `approved`
- `published`
- `retired`

### Review levels

- `level_0_admin` — administrative/metadata review
- `level_1_factual` — factual accuracy against cited public sources
- `level_2_clinical_wording` — clinical language and clarity
- `level_3_recommendation_impacting` — content that could affect recommendations
- `level_4_specialty_high_risk` — specialty or high-risk domains (e.g., pediatrics, pregnancy, renal replacement)

### Publication rules

- `publication_status: published` requires `review_status` of `approved` or `published`
- published monographs require at least one reviewer, `last_reviewed`, and `evidence_source_ids`
- remove `PLACEHOLDER_CLINICAL_CONTENT: true` and markdown placeholder markers before publication
- `clinically_usable` must remain `false` until project governance explicitly changes scaffold policy

## What counts as clinically meaningful content

Clinically meaningful content includes statements that could influence:

- prescribing or treatment selection
- dosing, frequency, route, or duration
- monitoring parameters or thresholds
- safety warnings or contraindications presented as guidance
- efficacy expectations for clinical decision-making
- patient counseling that implies what a specific patient should do

These require citations, appropriate review level, and human approval before publication.

## What requires human review

- all clinician-facing recommendation-impacting content
- all patient-facing education intended for publication
- resolution of conflicting evidence
- approval of `review_status: approved` or `published`
- removal of placeholder markers
- any AI-drafted clinical wording

## Handling uncertainty and conflicting evidence

- document uncertainty in `known_gaps` and evidence claim `uncertainty_notes`
- do not silently resolve conflicts
- flag conflicts for human review and changelog documentation
- prefer `needs_human_review` over unsupported confidence in agent outputs

## Placeholder content

Placeholders exist to structure the repository without implying clinical readiness. Validation enforces:

- published monographs cannot contain `PLACEHOLDER_CLINICAL_CONTENT: true`
- published monographs cannot contain `[CLINICAL REVIEW REQUIRED — NOT YET DRAFTED]` in markdown files

## Validation

```bash
npm install
npm run validate
```

Fix all reported errors before requesting review. Warnings may be acceptable for draft scaffold content but should be understood and documented.

## AI-assisted contributions

When using AI tools:

- label AI-assisted drafts in changelog entries and pull request descriptions
- restrict inputs to public/open sources
- never submit proprietary reference text for summarization
- do not present AI output as reviewed or published clinical guidance
- ensure agent outputs set `requires_human_review: true`

See `agents/` for conservative prompt templates and structured I/O schemas.

## Code and schema changes

- keep dependencies minimal
- update JSON schemas when metadata models change
- update validation scripts when new safety rules are added
- document breaking changes in drug `changelog.md` files when applicable

## Conduct and safety

OpenRxCore must not be described as replacing commercial references or providing autonomous medical advice. Contributors should use serious, transparent language and prioritize patient safety through review gates and source transparency.

## Questions

Open an issue for governance, schema, or workflow questions. Clinical publication decisions belong to designated human reviewers under future project governance.
