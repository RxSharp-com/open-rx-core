# DailyMed section pointer model (proposed)

**Status:** Proposed model only. Not wired into `evidence.yaml` or main validation. **No real drug section pointers** exist in the repository.

Parent design: [dailymed-section-extraction-design.md](dailymed-section-extraction-design.md)

---

## Definition

A **section pointer** records **where** a label section exists for a specific DailyMed SPL (`setid`), not **what** the section says.

- **Section pointers alone are not clinical evidence synthesis.**
- **Section pointers do not authorize** patient-facing or clinician-facing content.
- **Section pointers must not contain long label text.**
- **No pointer field, regardless of name, may contain reproduced or closely paraphrased label wording.** Fields describe location and typing only.
- **Selected SPLs remain non-canonical** unless a future approved policy states otherwise (`canonical_status: non_canonical` default).

Public SPL/HL7 conventions (design context only): structured product labeling documents may organize content into nested sections; implementations sometimes expose **section codes** or **section identifiers** in XML or API metadata. OpenRxCore may store such codes in pointers when available from **metadata APIs** without copying section narrative text.

---

## Proposed record fields

| Field | Required | Description |
|-------|----------|-------------|
| `pointer_id` | yes | Stable id, e.g. `{drug_id}-ptr-dailymed-0001` |
| `drug_id` | yes | OpenRxCore drug folder id |
| `source_id` | yes | Must match existing `evidence.yaml` `dailymed_label` `source_id` |
| `setid` | yes | Must match referenced source `identifiers.setid` |
| `spl_version` | optional | From source or SPL metadata |
| `labeler` | optional | Should match source `identifiers.labeler` when known |
| `product_title` | optional | Short SPL title metadata; not full label body |
| `section_title` | optional | Short structural title from metadata; not copied narrative |
| `section_code` | optional | If available from future SPL metadata |
| `section_code_system` | optional | e.g. OID or code system id if documented publicly |
| `section_path` | optional | Logical path or hierarchy id if available |
| `section_identifier` | optional | Alternative stable section id if available |
| `section_url` | optional | DailyMed or SPL viewer URL with fragment if available |
| `section_anchor` | optional | URL fragment or anchor name |
| `section_type` | optional | Controlled enum proposal: `indications`, `dosage_administration`, `warnings`, `adverse_reactions`, `patient_counseling`, `clinical_pharmacology`, `other`, `unknown` — **typing only, no text** |
| `extraction_status` | yes | e.g. `not_extracted` (default), `extracted_needs_review` (future) |
| `reuse_status` | yes | Default `unknown_requires_review` |
| `license_note` | optional | Reuse basis if ever changed from default |
| `contains_text` | yes | Must be **`false`** for pointer-only records |
| `text_storage_policy` | yes | e.g. `no_text_in_pointer_file`, `extract_separate_artifact` |
| `last_verified` | optional | ISO date locator last checked |
| `review_required` | yes | Default `true` |
| `reviewer_notes` | optional | Short admin notes; no label excerpts |
| `route_group` | optional | e.g. `oral`, `injectable`, `unknown_requires_review` |
| `formulation_group` | optional | e.g. `capsule`, `injection_solution`, `powder_for_solution` |
| `source_scope` | optional | e.g. `temporary_working_source`, `additional_labeler_spl` |
| `canonical_status` | yes | Default `non_canonical`; must not be `canonical` without approved policy |
| `section_pointer_status` | optional | e.g. `proposed`, `verified_locator`, `needs_review` |

File-level metadata (proposed):

- `schema_version`
- `drug_id`
- `pointers` (array of records)

---

## Seven content layers (explicit)

**No layer automatically authorizes the next.**

1. **Source metadata** — Identifies a selected labeler/product/SPL source (`evidence.yaml` `dailymed_label`).
2. **Section pointer metadata** — Describes **where** a label section exists; `contains_text: false`; no section body.
3. **Extracted section text** — If ever allowed, stored separately from pointers; not in this branch.
4. **Evidence packet** — Structured evidence object; **requires human review**; not auto-created from pointers.
5. **Generated summary** — **Not** automatically permitted by section pointers; separate human/legal review.
6. **Clinician-facing content** — `clinician.md`; **separate approved workflow** required.
7. **Patient-facing content** — `patient.md`; **separate approved workflow** required.

```
(1) source metadata
  └── (2) section pointer metadata
        └── (3) extracted section text [future, separate artifact]
              └── (4) evidence packet [human review]
                    └── (5) generated summary [separate review]
                          └── (6) clinician-facing content [approved workflow]
                          └── (7) patient-facing content [approved workflow]
```

---

## Layer distinctions (summary)

Legacy diagram — see numbered layers above for authoritative definitions.

```
source metadata (evidence.yaml)
    └── section pointer (location only, contains_text: false)
            └── [future] extracted section text (separate file, heavy review)
                    └── [future] evidence packet (human-reviewed claim)
                            └── [future] generated summary (separate legal review)
                                    └── clinician.md / patient.md (publication workflow)
```

---

## Multi-SPL and route/formulation (design notes)

### Vancomycin

- **Temporary working injectable source:** Baxter injection solution SPL (checkpoint recorded in source-selection docs).
- **Future pointers** must support:
  - `route_group: oral` vs `route_group: injectable`
  - `formulation_group: capsule` vs `injection_solution` vs `powder_for_solution`
- Oral capsule SPLs in candidate metadata must not be implied by injectable pointers without explicit grouping.

**Continuing open questions (from source selection, not new to this design):** [dailymed-source-selection-review.md](dailymed-source-selection-review.md) · [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md)

- Whether **multiple temporary working sources per route** are allowed
- How **oral capsule vs injectable** sources should be modeled for vancomycin
- Whether **powder for solution** and **injection solution** should be **separate formulation groups**

### Daptomycin

- **History:** Dapzura RT (branded) → Hospira generic-named injectable from stored sample (human checkpoint).
- Pointers always scoped to **one setid**; `product_scope` may note branded vs generic-named title metadata.
- Additional labeler SPLs may gain pointers later; none are canonical.

### Cefazolin, cefepime, ceftriaxone

- Multiple labelers in candidate samples; design allows multiple `source_id` + pointer sets.
- Avoid single-SPL extraction templates in tooling.

---

## Connection to evidence.yaml (future)

Proposed patterns (not implemented):

- **Citations:** `citation_type: section_pointer` with `locator: pointer:{pointer_id}` or `setid:…;section_code:…`
- **Sources:** optional `section_pointer_ids: []` on `dailymed_label` sources
- **Packets:** `citation_ids` must reference citations that resolve to pointers or extracts; no `approved` packets with `unknown_requires_review` sources

`evidence.yaml` is unchanged in the design branch.

---

## Future validation rules

### Pointer file content

- Forbidden fields (any nesting): `body_text`, `label_text`, `full_text`, `label_xml`, `label_html`, `html`, `xml`, `dosing_text`, `warnings_text`, `adverse_reactions_text`, `counseling_text`
- **No field name** may be used to smuggle text; a **provisional** max string length per value (default 320 chars, aligned with evidence packet guard) may flag accidentally large pasted blocks
- **String-length checks are a heuristic guard only.** They are **not** sufficient protection against copied, quoted, or closely paraphrased label text. They are **not** a complete copyright, reuse, or paraphrase-safety mechanism. **Human review** remains required to detect copied, closely paraphrased, or meaningfully reproduced label language in permitted fields.
- `contains_text` must be `false` for pointer-only files
- `canonical_status` must not be `canonical` unless an approved policy flag exists in project config (none today)

### Referential integrity

- `source_id` must exist on same `drug_id` `evidence.yaml`
- `setid` must equal that source’s `identifiers.setid`
- `drug_id` must match folder name

### Controlled values (when implemented)

- `route_group`, `formulation_group`, `section_type` — enums in schema; unknown values fail closed

### Evidence and monograph

- No section-derived packet `approved` without human review workflow
- No section-derived content in `patient.md` / `clinician.md` until approved workflow exists

### Implemented now (fixtures only — not production schema)

`scripts/lib/section-pointer-rules.js` is a **proposed/future-rule validator for fictional fixtures and demos only**. It is **not** wired into `scripts/validate.js` and must not be treated as the full production schema implementation.

- Forbidden field names
- `contains_text === false`
- `canonical_status !== 'canonical'`
- Provisional max string length per value (default 320) — **heuristic only**; see wording above

Run: `npm run validate:dailymed-section-pointer-failure-demo`

---

## Example fixtures (fictional only)

- `fixtures/dailymed-section-pointers/example-section-pointers.yaml` — valid fictional pointers
- `fixtures/dailymed-section-pointers/failure-section-pointer-with-body-text.yaml` — expects validation failure

Fixtures use **exampledrug** only (no real OPAT drug names), fake setids (e.g. `example-setid-0000`), **Example Labeler, Inc.**, and mock product/section titles. **No real OPAT drug pointers** in this branch.
