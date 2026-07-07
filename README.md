# OpenRxCore

**Open medication knowledge infrastructure — early scaffold, not for clinical use.**

OpenRxCore (`open-rx-core`) is an open-source medication knowledge engine intended to support a future public-facing, citation-native medication reference called **SourceScript**. It is designed as reusable open medication knowledge infrastructure, not as a direct replacement for commercial drug references.

## Current status

This repository is an **early scaffold and prototype**. It is **not clinically usable**. Placeholder drug folders, schemas, agent prompt templates, and validation scripts are provided for contributors and builders. No clinical recommendations, dosing guidance, or patient counseling content are included.

**Do not use OpenRxCore for clinical decision-making, patient care, or medical advice.**

## What OpenRxCore is

OpenRxCore aims to become a public, version-controlled medication knowledge base built from:

- public and open evidence sources
- structured evidence packets
- AI-assisted evidence surveillance (with human oversight)
- human-reviewed clinical synthesis

It emphasizes:

- public/open source evidence
- original human-reviewed synthesis
- structured medication monographs with clinician-facing and patient-facing versions from the same evidence backbone
- visible reviewer metadata and conflicts-of-interest fields
- known gaps and public changelogs
- version-controlled, citation-linked claims
- AI-assisted proposed updates with **human approval before publication**
- API access for open-source and institutional tools (future)

### Initial clinical domain

The initial scaffold focuses on **OPAT (outpatient parenteral antimicrobial therapy) and infectious diseases**, starting with placeholder folders for:

- cefazolin
- cefepime
- ceftriaxone
- daptomycin
- vancomycin

## What OpenRxCore is not

OpenRxCore is **not**:

- a free replacement for Lexicomp, Micromedex, Sanford Guide, UpToDate, DynaMed, or other commercial references
- an AI doctor or AI pharmacist
- an autonomous treatment recommendation engine
- a patient-specific prescribing tool
- a clinically usable reference in its current state

OpenRxCore does **not** encourage clinicians or institutions to cancel subscriptions to commercial references. Commercial drug references, institutional protocols, and specialty resources remain important—especially for high-risk, patient-specific, specialty, pediatric, pregnancy, oncology, transplant, renal replacement therapy, IV compatibility, and complex dosing decisions.

## Audience and positioning

**Primary audience:** contributors and builders—including pharmacists, clinicians, clinical educators, informatics professionals, open-source developers, public health contributors, and teams building medication education or clinical knowledge tools.

**Secondary audiences** may include clinicians, trainees, educators, healthcare organizations, and open-source health projects seeking transparent, source-linked medication information for education, review, patient counseling support, or integration.

**Positioning:** OpenRxCore complements existing resources; it is **not** positioned as a replacement. It is a transparent, reusable, public-source medication knowledge layer that can improve access where commercial subscriptions are unavailable, unaffordable, insufficiently transparent, or not reusable for open-source tools.

## Relationship to SourceScript

**SourceScript** is the planned future public-facing project that may consume OpenRxCore content. OpenRxCore is the open infrastructure layer; SourceScript would present reviewed, citation-native medication reference material to end users. Neither is clinically usable in this scaffold phase.

## Safety boundaries

- `project.config.json` sets `clinicalUseStatus: not_for_clinical_use`.
- Every scaffold monograph sets `clinically_usable: false` and `PLACEHOLDER_CLINICAL_CONTENT: true`.
- Patient and clinician markdown files contain `[CLINICAL REVIEW REQUIRED — NOT YET DRAFTED]`.
- Validation **rejects published monographs** that retain placeholder markers or lack required reviewer and evidence metadata.
- Patient-facing content (when eventually drafted) must be reviewed plain-language education only—not unreviewed AI drafts or patient-specific medical advice.

## Public and open source policy

### Allowed sources

- DailyMed
- openFDA
- RxNorm/RxNav
- PubMed metadata
- PMC open-access content when license permits reuse
- ClinicalTrials.gov
- FDA safety communications
- CDC, NIH, and FDA public materials
- open guidelines when license permits reuse
- original human-authored synthesis based on public/open sources

### Prohibited sources

Do **not** copy, summarize from, paraphrase from, train on, or structure content from proprietary subscription references, including Lexicomp/Lexidrug, Micromedex, Sanford Guide, UpToDate, DynaMed, commercial drug databases, or paywalled guideline text unless license explicitly permits reuse.

Facts from public sources may be used; **wording, table structure, recommendation framing, and proprietary editorial synthesis must be original.**

## Human review requirement

Human clinical review is required before any monograph can be marked `approved` or `published`. Published monographs must include reviewer metadata, review date, evidence sources, known gaps, and changelog history. `requireHumanReviewForPublication` is `true` in project configuration.

## AI agent role and limitations

AI agents may assist with public source surveillance, source ingestion, evidence extraction, citation auditing, validation, and documentation.

AI agents must **not**:

- publish clinical recommendations automatically
- finalize dosing, monitoring, safety, efficacy, or counseling recommendations without human review
- copy or paraphrase proprietary medical references
- bypass paywalls or use institutional subscription content
- create uncited clinical claims
- resolve conflicting evidence without flagging it for human review

Initial agent templates live under `agents/`:

- `source-surveillance`
- `drug-identity`
- `evidence-extraction`
- `citation-auditor`

## Content structure

```
content/
  drugs/
    <drug_id>/
      monograph.yaml    # metadata, review status, file references
      patient.md        # patient-facing monograph (placeholder in scaffold)
      clinician.md      # clinician-facing monograph (placeholder in scaffold)
      evidence.yaml     # structured evidence packet
      changelog.md      # version history
schema/                 # JSON schemas
agents/                 # agent prompt templates and I/O schemas
scripts/                # validation scripts
project.config.json     # project metadata and safety flags
```

### Review workflow

Review status values:

`not_started` → `source_imported` → `ai_drafted` → `needs_clinical_review` → `needs_revision` → `approved` → `published` → `retired`

Review levels:

- `level_0_admin`
- `level_1_factual`
- `level_2_clinical_wording`
- `level_3_recommendation_impacting`
- `level_4_specialty_high_risk`

### Placeholder content

Scaffold placeholders use:

- `PLACEHOLDER_CLINICAL_CONTENT: true` in `monograph.yaml`
- `[CLINICAL REVIEW REQUIRED — NOT YET DRAFTED]` in markdown monographs

Validation rejects these markers in **published** monographs.

## Validation workflow

Install dependencies and run validation:

```bash
npm install
npm run validate
```

The validation script checks:

- required drug folder files exist
- `monograph.yaml` and `evidence.yaml` validate against JSON schemas (see `schema/README.md`)
- publication/review status consistency (`published` requires `review_status` of `approved` or `published`)
- published monograph reviewer, `last_reviewed`, evidence, and citation requirements
- no placeholder content in published monographs
- `clinically_usable` must be `false`: enforced by `schema/monograph.schema.json` (`const: false`) and rejected as a **hard error** if set to `true` in `scripts/validate.js`
- `project.config.json` required fields and values (`clinicalUseStatus`, `requireHumanReviewForPublication`, `audiencePrimary`, `positioning`, and related metadata)

**Errors vs. warnings:** validation exits with a non-zero code on errors only. Warnings are informational. The current warning tier flags draft monographs that omit `PLACEHOLDER_CLINICAL_CONTENT: true` (unexpected for scaffold placeholders).

Demonstrate a deliberate safety gate failure:

```bash
node scripts/validate-failure-demo.js
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

See [LICENSE.md](LICENSE.md). **License: TBD** — to be selected by maintainers.

## Disclaimer

OpenRxCore does not provide medical advice. It does not replace clinical judgment, institutional protocols, or validated commercial references. Content in this repository is for infrastructure development and contribution workflows only until explicitly reviewed and published under future project governance.
