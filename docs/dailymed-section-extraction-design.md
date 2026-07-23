# DailyMed section extraction — design (no implementation)

**Status:** Design-only. **No section extraction is implemented in OpenRxCore.** OpenRxCore remains **not for clinical use**.

This document describes how OpenRxCore could **reference** DailyMed label sections in the future **without** storing long copied label text in the repository.

Related: [dailymed-section-pointer-model.md](dailymed-section-pointer-model.md) · [dailymed-source-normalization.md](dailymed-source-normalization.md) · [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md) · [dailymed-source-selection-review.md](dailymed-source-selection-review.md) · [evidence-model.md](evidence-model.md) · [citation-policy.md](citation-policy.md)

---

## Purpose

Answer, at design time:

- How to **point to** SPL sections (location metadata) without importing section bodies
- Where section pointers should live vs raw DailyMed fetch artifacts vs derived reviewed metadata
- How pointers connect to `evidence.yaml` sources, citations, and evidence packets
- How to support **multiple SPLs** and **route/formulation groups** (especially vancomycin)
- What **validation** and **human review gates** must exist before any extraction code ships

---

## Non-goals (this branch and until policy sign-off)

- Fetching or storing DailyMed label XML/HTML/body text
- Extracting dosing, warnings, adverse reactions, counseling, or other section text
- Creating section-derived evidence packets with clinical claims
- Creating or updating `patient.md` or `clinician.md`
- Approving evidence packets
- Changing selected SPL `setid` values or `reuse_status`
- API, UI, chatbot, or surveillance agents
- New npm dependencies

---

## Safety boundaries

| Layer | Allowed in design phase | Not allowed |
|-------|------------------------|-------------|
| Source metadata | Existing `evidence.yaml` DailyMed sources, `search-candidates.json`, `fetch-metadata.json` | Treating one SPL as whole-drug canonical label |
| Section pointers | Fictional fixtures; proposed fields; `contains_text: false` | Long strings; reproduced label wording |
| Extracted text | Not stored in repo | Any dosing/warning/counseling excerpts |
| Evidence packets | Existing metadata-only packets | Section-derived clinical claims |
| Monograph | Placeholder scaffold | Patient/clinician guidance |

Section pointers are **not** clinical evidence synthesis. They do **not** authorize patient-facing or clinician-facing content.

---

## Copyright / reuse boundaries

- `reuse_status` on sources and pointers remains **`unknown_requires_review`** unless human/legal review documents otherwise.
- Pointer records describe **where** a section may be found (setid, locator, URL anchor), not **what** the section says.
- Any future extracted text is a **separate artifact** with its own reuse review; it must not flow into monograph markdown without an approved workflow.
- Design references to SPL structure (e.g. HL7 SPL documents may use coded section identifiers) are **generic conventions only** — this branch does not quote or paraphrase real label section content.

---

## Relationship to normalization and source selection

**Normalization** ([dailymed-source-normalization.md](dailymed-source-normalization.md)): every pointer must bind to a **specific `setid`** and labeler-scoped source; `canonical_status` defaults to **non_canonical**.

**Source selection** ([dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md), [dailymed-source-selection-review.md](dailymed-source-selection-review.md)):

- One **temporary working** DailyMed source per drug today; design must allow **multiple** `source_id` / `setid` per `drug_id` later.
- **Daptomycin:** human checkpoint replaced Dapzura RT with a **generic-named injectable** Hospira SPL from stored candidates — still one labeler-specific SPL, not “the generic daptomycin label.”
- **Vancomycin:** Baxter **injection solution** remains temporary working injectable source; **route/formulation grouping** is an open modeling direction (oral capsule vs injectable; powder vs injection solution TBD).

Section extraction design must **not** assume a single SPL per generic drug.

---

## Seven content layers (explicit)

OpenRxCore treats these as **separate layers**. **No layer automatically authorizes the next.**

| # | Layer | What it is | What it is not |
|---|--------|------------|----------------|
| 1 | **Source metadata** | Identifies a selected labeler/product/SPL (`evidence.yaml` `dailymed_label`, setid, labeler) | The whole generic drug label; not clinical synthesis |
| 2 | **Section pointer metadata** | Describes **where** a label section exists (locator, codes, URLs); `contains_text: false` | Section body text; not evidence of clinical claims |
| 3 | **Extracted section text** | Future optional artifact, if ever permitted; separate storage and reuse review | Pointer fields; not committed in this branch |
| 4 | **Evidence packet** | Structured evidence object in `evidence.yaml`; requires human review | Auto-created from pointers or extracts |
| 5 | **Generated summary** | Future human/legal-reviewed synthesis derived from sources | Permitted automatically by section pointers |
| 6 | **Clinician-facing content** | `clinician.md` (future); separate approved publication workflow | Implied by packets or pointers |
| 7 | **Patient-facing content** | `patient.md` (future); separate approved publication workflow | Implied by packets or pointers |

- **Source metadata** identifies a selected labeler/product/SPL source.
- **Section pointer metadata** describes where a label section exists.
- **Extracted section text**, if ever allowed, is separate from pointer metadata.
- **Evidence packets** are structured evidence objects and require human review.
- **Generated summaries** are not automatically permitted by section pointers.
- **Clinician-facing** and **patient-facing** content each require a separate approved workflow.

---

## Section pointer model (summary)

A **section pointer** is metadata that answers: “For this `source_id` / `setid`, where is section X in DailyMed (or SPL structure), without storing X’s text?”

Full field definitions: [dailymed-section-pointer-model.md](dailymed-section-pointer-model.md).

Distinctions (see [seven content layers](#seven-content-layers-explicit) above for full detail):

| Artifact | Role |
|----------|------|
| Source metadata | `evidence.yaml` `dailymed_label` record (setid, labeler, title) |
| Section pointer | Locator + type + extraction/review status; **no body text** |
| Extracted section text | Future optional blob/file; not in this branch |
| Evidence packet | Human-reviewed claim with citations; not created from pointers alone |
| Generated summary | Future; separate legal/clinical review |
| Clinician-facing content | `clinician.md`; gated workflow |
| Patient-facing content | `patient.md`; gated workflow |

---

## Proposed file placement (recommendation)

| Location | Use | This branch |
|----------|-----|-------------|
| `data/raw/dailymed/{drug_id}/` | API/metadata fetch only (candidates, fetch-metadata) | Unchanged |
| `data/derived/dailymed/{drug_id}/section-pointers.yaml` | **Recommended** reviewed pointer index per drug | **Not created for real drugs** |
| `content/drugs/{drug_id}/sections.yaml` | Alternative: colocate with drug folder | Defer choice until schema branch |
| `content/drugs/{drug_id}/sources/dailymed-sections.yaml` | Alternative: nest under sources | Same |

**Recommendation:** `data/derived/dailymed/{drug_id}/section-pointers.yaml`

- Keeps **raw** (`data/raw/`) separate from **derived/reviewed** metadata
- Avoids implying pointers are “content” like monograph sections
- `evidence.yaml` would later reference `pointer_id` values via citations (e.g. `locator: pointer:…`) or a dedicated `section_pointer_ids` list on sources — **schema TBD** in `feature/dailymed-section-pointer-schema`

Extracted text (if ever stored) should live outside pointers (e.g. `data/derived/dailymed/{drug_id}/extracts/` with strict size caps and review flags) — **out of scope for implementation now**.

---

## Multi-SPL and route/formulation support

Proposed conservative concepts (documentation only until schema branch):

| Concept | Intent |
|---------|--------|
| `source_scope` | e.g. `single_labeler_spl`, `temporary_working_source` |
| `canonical_status` | `non_canonical` default; no approved canonical policy today |
| `route_group` | e.g. `oral`, `injectable`, `unknown_requires_review` |
| `formulation_group` | e.g. `capsule`, `injection_solution`, `powder_for_solution`, `lyophilized_injection` |
| `source_group` | Optional bucket linking multiple pointers under one route/formulation policy |
| `product_scope` | Branded vs generic-named product line (daptomycin history) |
| `section_pointer_status` | e.g. `proposed`, `verified_locator`, `needs_review` |
| `extraction_status` | e.g. `not_extracted`, `extracted_needs_review` (future) |

**Vancomycin:** pointers must be filterable by `route_group` so oral capsule SPLs are not mixed with injectable working sources without explicit human grouping.

**Vancomycin open questions (continuing from source selection — not new gaps):** See [dailymed-source-selection-review.md](dailymed-source-selection-review.md) and [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md). Still unresolved for extraction design:

- Whether **multiple temporary working sources per route** are allowed
- How **oral capsule vs injectable** vancomycin sources should be modeled
- Whether **powder for solution** and **injection solution** should be **separate formulation groups**

**Daptomycin:** design notes should record that working source is Hospira generic-named injectable from stored sample; additional SPLs (including prior Dapzura RT) may gain pointers later without replacing normalization rules.

**Cefazolin, cefepime, ceftriaxone, daptomycin, vancomycin:** multiple labelers exist in candidate metadata; extraction design must allow multiple `source_id` records and pointer sets per drug.

---

## Human review gates (required before production use)

1. **Pointer creation:** locator verified against DailyMed/SPL structure (human or tooling with human sign-off).
2. **Extraction:** no automated bulk extraction; no unattended jobs.
3. **Evidence packets:** any packet citing extracted text requires `requires_human_review: true`; no `approved` until review policy exists.
4. **Monograph:** no section-derived text in `patient.md` / `clinician.md` until dedicated publication workflow exists.
5. **Reuse:** `reuse_status` and `license_note` reviewed per SPL/pointer before `public_domain` or reusable summaries.

---

## Validation requirements (proposed)

See [dailymed-section-pointer-model.md](dailymed-section-pointer-model.md) for the full list.

**Implemented in this branch (fixtures only):** `scripts/lib/section-pointer-rules.js` + `npm run validate:dailymed-section-pointer-failure-demo` on fictional fixtures. **Main `npm run validate` does not load real drug pointer files yet.**

**String-length checks (provisional heuristic only):** The current max string length check (default 320 characters, aligned with evidence packet guards) is a **heuristic guard against accidental large pasted text blocks**. It is **not** sufficient protection against copied, quoted, or closely paraphrased label text. It is **not** a complete copyright, reuse, or paraphrase-safety mechanism. **Human review** remains required to detect copied, closely paraphrased, or meaningfully reproduced label language in permitted fields.

---

## Open questions

- JSON vs YAML for pointer files; versioning and `schema_version`
- Whether pointers live in repo vs generated CI artifacts
- Citation `locator` format for pointers vs setid+section_code
- Controlled vocabularies for `route_group` / `formulation_group`
- Additional non-length validation for paraphrase detection (human review primary)
- Vancomycin modeling questions carried forward from source-selection docs (see [Multi-SPL and route/formulation support](#multi-spl-and-routeformulation-support))

---

## Recommended implementation sequence

1. **`feature/dailymed-section-pointer-schema`** — JSON Schema for pointer files; wire into `validate.js` when real files exist
2. **Locator verification tooling** — metadata-only DailyMed/SPL structure checks (no body storage)
3. **Pilot pointers** — one fictional or single-SPL lab drug in fixture mode first; then human-reviewed real drug if policy approves
4. **Extraction prototype** — behind feature flag; outputs to derived extracts with forbidden-field validation
5. **Evidence packet linkage** — citations from pointers to draft packets only

**Do not implement steps 2–5 in this branch.**

---

## Fictional fixtures

Example and failure fixtures under `fixtures/dailymed-section-pointers/` use **fictional `exampledrug` IDs only** — not cefazolin, cefepime, ceftriaxone, daptomycin, vancomycin, or other real OPAT drugs. They use obviously fake setids, labelers, and product titles (e.g. `Example Labeler, Inc.`, `EXAMPLEDRUG MOCK PRODUCT`). They are **not** used by main validation and must not be mistaken for real DailyMed data.
