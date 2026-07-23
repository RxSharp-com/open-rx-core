# DailyMed section pointer model

**Status:** Formal schema **v1.0** in [schema/dailymed-section-pointer.schema.json](../schema/dailymed-section-pointer.schema.json). **No real drug section pointers** exist in the repository. Schema existence does **not** authorize section extraction, copied label text, evidence packets, generated summaries, or patient/clinician-facing content.

**Future file placement (YAML):** `data/derived/dailymed/{drug_id}/section-pointers.yaml`

Parent design: [dailymed-section-extraction-design.md](dailymed-section-extraction-design.md)

Fixture validation (fictional only): `npm run validate:dailymed-section-pointer-failure-demo` — not wired into `scripts/validate.js`.

---

## Definition

A **section pointer** records **where** a label section exists for a specific DailyMed SPL (`setid`), not **what** the section says.

- **Section pointers alone are not clinical evidence synthesis.**
- **Section pointers do not authorize** patient-facing or clinician-facing content.
- **Section pointers must not contain long label text.**
- **No pointer field, regardless of name, may contain reproduced or closely paraphrased label wording.** Fields describe location and typing only. **Human review** remains required; heuristic validators cannot detect paraphrase.
- **Selected SPLs remain non-canonical** (`canonical_status: non_canonical` only in schema v1.0).
- **No layer automatically authorizes the next** (see seven content layers below).

Public SPL/HL7 conventions (design context only): structured product labeling documents may organize content into nested sections; implementations sometimes expose **section codes** or **section identifiers** in XML or API metadata. OpenRxCore may store such codes in pointers when available from **metadata APIs** without copying section narrative text.

---

## Top-level file fields (schema v1.0)

| Field | Required | Description |
|-------|----------|-------------|
| `schema_version` | yes | Must be `"1.0"` |
| `drug_id` | yes | OpenRxCore drug folder id |
| `source_scope` | yes | How this pointer file relates to source selection (controlled enum; see below) |
| `pointers` | yes | Array of pointer records (min length 1) |

`additionalProperties: false` at file level — unknown top-level keys fail schema validation.

---

## Pointer record fields (schema v1.0)

| Field | Required | Description |
|-------|----------|-------------|
| `pointer_id` | yes | Stable id (e.g. `{drug_id}-dailymed-section-0001`) |
| `drug_id` | yes | Must align with file-level `drug_id` when real files exist (referential rule future) |
| `source_id` | yes | Future: must match `evidence.yaml` `dailymed_label` `source_id` |
| `setid` | yes | SPL setid for this labeler/product scope |
| `spl_version` | yes | SPL version metadata string |
| `labeler` | yes | Labeler name metadata (not label body) |
| `product_title` | yes | Short SPL title metadata |
| `section_title` | yes | Short structural title from metadata |
| `section_type` | yes | Locator category only (controlled enum) — **not** authorization to extract or publish clinical content |
| `extraction_status` | yes | Pointer/extraction lifecycle (controlled enum) |
| `reuse_status` | yes | Must be `unknown_requires_review` in v1.0 |
| `contains_text` | yes | Must be **`false`** |
| `text_storage_policy` | yes | `pointer_metadata_only` or `no_text_storage_allowed` |
| `review_required` | yes | Must be **`true`** in v1.0 |
| `source_scope` | yes | Per-pointer scope (same enum as file-level) |
| `canonical_status` | yes | Must be **`non_canonical`** in v1.0 |
| `section_pointer_status` | yes | `draft`, `needs_review`, `blocked`, or `retired` |
| `section_code` | optional | Coded section id when available from metadata |
| `section_code_system` | optional | Code system id / OID when documented |
| `section_path` | optional | Logical hierarchy path |
| `section_identifier` | optional | Alternative stable section id |
| `section_url` | optional | Viewer URL with fragment if available |
| `section_anchor` | optional | URL fragment or anchor |
| `last_verified` | optional | ISO date locator last checked |
| `reviewer_notes` | optional | Short admin notes; no label excerpts |
| `route_group` | optional | Conservative route bucket (see enums) — **vancomycin** future modeling uses `injectable` / `oral` / `unknown` |
| `formulation_group` | optional | Conservative formulation bucket |
| `license_note` | optional | Reuse basis notes |

`additionalProperties: false` on each pointer — **text-bearing property names are not in the schema** and are rejected if present.

### Non-canonical SPL-specific sources

Each pointer is bound to one `setid`, `labeler`, and `product_title` metadata tuple. `source_scope` values such as `selected_spl`, `temporary_working_source`, `route_group_source`, `formulation_group_source`, and `multi_spl_source` document that the locator is labeler/product-specific and **not** a canonical whole-drug label. `canonical_status: non_canonical` is required.

### Route / formulation grouping (later)

`route_group` and `formulation_group` use conservative enums (`unknown`, `not_applicable`, `oral`, `injectable`, `example_route`, etc.). Multiple working sources per route are a **future policy** question; schema allows scoped pointers per source without implying a single SPL per drug.

---

## Controlled values (schema v1.0)

| Field | Allowed values |
|-------|----------------|
| `schema_version` | `1.0` |
| `extraction_status` | `pointer_only`, `extraction_not_started`, `extraction_blocked`, `extraction_design_only` |
| `reuse_status` | `unknown_requires_review` |
| `text_storage_policy` | `pointer_metadata_only`, `no_text_storage_allowed` |
| `review_required` | `true` |
| `canonical_status` | `non_canonical` |
| `section_pointer_status` | `draft`, `needs_review`, `blocked`, `retired` |
| `source_scope` | `fictional_example`, `selected_spl`, `route_group_source`, `formulation_group_source`, `temporary_working_source`, `multi_spl_source` |
| `route_group` | `unknown`, `not_applicable`, `oral`, `injectable`, `example_route` |
| `formulation_group` | `unknown`, `not_applicable`, `capsule`, `powder_for_solution`, `injection_solution`, `lyophilized_powder_for_solution`, `example_formulation` |
| `section_type` | `example_section`, `labeling_section_pointer`, `contraindications`, `warnings_and_precautions`, `adverse_reactions`, `dosage_and_administration`, `clinical_pharmacology`, `microbiology`, `how_supplied_storage_handling`, `patient_counseling_information`, `other` |

`section_type` values name **locator categories** only. They do not authorize extraction, clinical claims, evidence packets, or monograph content.

---

## Text-bearing fields forbidden

Schema `additionalProperties: false` plus fixture validation reject these keys at any nesting depth:

`body_text`, `label_text`, `full_text`, `section_text`, `extracted_text`, `summary_text`, `generated_summary`, `label_xml`, `label_html`, `html`, `xml`, `dosing_text`, `warnings_text`, `adverse_reactions_text`, `counseling_text`, `patient_text`, `clinician_text`

**Provisional max string length** (default 320 characters per string value) is a **heuristic only** — not copyright, reuse, or paraphrase safety.

---

## Citation locators (designed, not wired)

Future `evidence.yaml` citations may use patterns such as:

- `citation_type: section_pointer` with `locator: pointer:{pointer_id}`
- or structured locators combining `setid` and `section_code`

**Schema v1.0 does not add citation fields to pointer files.** No real evidence packets are linked in this branch. Pointer metadata does not authorize evidence packets or monograph content.

---

## Seven content layers (explicit)

**No layer automatically authorizes the next.**

1. **Source metadata** — `evidence.yaml` `dailymed_label` (setid, labeler).
2. **Section pointer metadata** — this schema; `contains_text: false`.
3. **Extracted section text** — separate artifact if ever permitted.
4. **Evidence packet** — human-reviewed; not auto-created from pointers.
5. **Generated summary** — separate human/legal review.
6. **Clinician-facing content** — `clinician.md`; approved workflow.
7. **Patient-facing content** — `patient.md`; approved workflow.

---

## Validation (fixtures only today)

`scripts/lib/section-pointer-rules.js` + AJV against [schema/dailymed-section-pointer.schema.json](../schema/dailymed-section-pointer.schema.json) in `scripts/validate-dailymed-section-pointer-failure-demo.js`.

| Rule | Notes |
|------|-------|
| JSON Schema v1.0 | Required fields, enums, `contains_text: false`, etc. |
| Forbidden field names | Heuristic guard list |
| Initial OPAT `drug_id` rejection | `cefazolin`, `cefepime`, `ceftriaxone`, `daptomycin`, `vancomycin` rejected in **fixture** validation until real-data readiness |
| `reuse_status` | Must be `unknown_requires_review` |
| `review_required` | Must be `true` |
| `canonical_status` | Must be `non_canonical` |
| Provisional string length | Default 320 — heuristic only |

**Not implemented yet:** referential integrity to `evidence.yaml`, `pointer_id` uniqueness within `pointers[]` (open question for next branch), main `validate.js` loading of `data/derived/dailymed/.../section-pointers.yaml`.

Run: `npm run validate:dailymed-section-pointer-failure-demo`

---

## Fictional fixtures

Under `fixtures/dailymed-section-pointers/` ( **exampledrug** and fake metadata only; failure fixtures use fictional SPL data except `failure-section-pointer-real-drug-name.yaml`, which uses `drug_id: cefazolin` only to test OPAT id rejection):

| File | Intent |
|------|--------|
| `example-section-pointers.yaml` | Valid v1.0 fictional example |
| `failure-section-pointer-with-body-text.yaml` | Forbidden `body_text` |
| `failure-section-pointer-contains-text-true.yaml` | `contains_text: true` |
| `failure-section-pointer-canonical.yaml` | `canonical_status: canonical` |
| `failure-section-pointer-long-string.yaml` | Provisional length heuristic |
| `failure-section-pointer-real-drug-name.yaml` | OPAT `drug_id` rejection |

---

## Open questions (next branches)

- **`pointer_id` uniqueness** within a single file’s `pointers` array — enforce in schema vs. validator?
- Referential integrity rules when real files land under `data/derived/dailymed/{drug_id}/section-pointers.yaml`
- Citation `locator` format finalization in `evidence.schema.json`
- Controlled vocabulary expansion for `route_group` / `formulation_group` after human review

**Recommended next branch:** `feature/dailymed-section-pointer-real-data-readiness-check`
