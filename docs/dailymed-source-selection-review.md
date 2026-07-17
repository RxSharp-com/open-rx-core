# DailyMed source-selection review (initial OPAT drugs)

Structured review of **metadata already committed** in OpenRxCore for the five initial OPAT drugs. This is a **source-selection review only** — not clinical review, not label section extraction, and not a determination of which SPL is “best” for care.

See also: [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md) · [dailymed-source-normalization.md](dailymed-source-normalization.md) · [dailymed-opat-metadata-expansion.md](dailymed-opat-metadata-expansion.md)

**OpenRxCore is not clinically usable.** Title-based notes below use cautious phrasing only (`title metadata suggests`, `requires human review`, `not a clinical selection`, `not canonical`). This review uses the **current stored candidate sample** in the repository only — not live DailyMed as an exhaustive catalog.

## Highest-priority human review flags

Title-metadata and source-selection issues only — **not clinical conclusions**.

**Update (human checkpoint decisions recorded):** See [Human checkpoint decisions (recorded)](#human-checkpoint-decisions-recorded). Items below describe the pre-checkpoint review context.

1. **Daptomycin (resolved by checkpoint):** Branded Dapzura RT was superseded by a **generic-named injectable** SPL from the stored candidate sample (Hospira, Inc.; setid `1957b6ce-7382-4a7b-bf02-3595948d09c6`). Still **non-canonical**; extraction requires further human/legal review.

2. **Vancomycin (checkpoint recorded):** Baxter **injection solution** SPL remains the **temporary working injectable** source. **Route/formulation grouping** is required going forward (oral capsule vs injectable minimum).

## Human checkpoint decisions (recorded)

Decisions below are **source-selection metadata only** — not clinical recommendations, not canonical label designations.

| Drug | Decision | setid (unchanged unless noted) |
|------|----------|--------------------------------|
| Daptomycin | Use **generic-named injectable** SPL from stored candidates instead of Dapzura RT | **Changed to** `1957b6ce-7382-4a7b-bf02-3595948d09c6` (Hospira, Inc.; result_position 2) |
| Vancomycin | Keep **Baxter injection solution** as temporary working injectable source | `99e523d8-9bde-43cb-8434-497015e5dcbd` (unchanged) |
| Vancomycin | Model by **route/formulation group** (oral capsule vs injectable minimum; powder vs injection TBD) | Policy direction; not yet implemented in schema |

### Daptomycin — prior temporary working SPL (audit history)

Before the human source-selection checkpoint, OpenRxCore imported this **metadata-only** temporary working SPL:

| Field | Prior value |
|-------|----------------|
| Product / title | DAPZURA RT (DAPTOMYCIN) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION |
| Labeler | Baxter Healthcare Corporation |
| setid | `cb1283e1-35b8-425c-b338-d9ac0c7161f8` |
| Sample position | `result_position` 1 |

**Why replaced:** Human checkpoint preferred a **generic-named injectable SPL** from the **stored candidate sample** if one existed (title metadata review only — not a clinical selection).

**Replacement:** Hospira, Inc. generic-named injectable SPL (`1957b6ce-7382-4a7b-bf02-3595948d09c6`, `result_position` 2). Still **one labeler/product-specific SPL**; **non-canonical**; **not** covering every daptomycin SPL; other SPLs remain unevaluated. Section extraction/synthesis still requires human approval.

**Tooling:** `package.json` script `fetch:dailymed:daptomycin` was updated to the new explicit setid so npm fetch helpers match `evidence.yaml` (metadata-only fetch; no behavior change beyond setid).

## Cross-cutting source-selection problems

| Problem | What the metadata shows | Risk |
|--------|-------------------------|------|
| Many SPLs per generic name | `total_results` ranges from 16 (cefepime) to 88 (vancomycin) | A single imported SPL cannot represent the whole drug |
| Capped candidate samples | 25-candidate cap for drugs with `total_results` > 25 | Unsampled SPLs may include other labelers, routes, or products |
| API sort order | `result_position` 1 varies by drug (e.g. vancomycin capsules at positions 1–2) | First search result is never canonical; easy to mis-import without explicit `setid` |
| Multiple labelers | 12–15 distinct labelers in each 16–25 candidate sample | Labeler/product-specific labeling may differ; reconciliation undefined |
| WG Critical Care at position 1 | Cefazolin, cefepime, and ceftriaxone selected SPLs share the same labeler and `result_position` 1 in sample | Convenience alignment across drugs is **not** a clinical or policy endorsement |
| Product-branded SPL titles | Daptomycin **prior** working SPL was Dapzura RT (position 1); checkpoint moved to generic-named injectable in sample | Branded vs generic-named SPL policy recorded via checkpoint |
| Route/formulation mixing (vancomycin) | Capsules, powders, injections, and solutions appear in the vancomycin sample | Generic `drug_name=vancomycin` search conflates routes; tracking may need split by formulation/route |
| Explicit setid vs position 1 | Some drugs selected SPL at `result_position` 1; vancomycin selected at position 4 | Selection method must stay explicit `setid`; position must not imply preference |

## Per-drug review

### Cefazolin

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 41 |
| Candidates stored | 25 (capped) |
| Selected `setid` | `1999084a-124c-45f9-801f-416a1b942c96` |
| Selected title | CEFAZOLIN INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC] |
| Selected labeler | WG CRITICAL CARE, LLC |
| Formulation/route (title only) | Title metadata suggests injectable powder for solution |
| Multiple labelers in sample? | Yes — candidate list suggests ~15 labelers in the stored sample |
| Multiple formulations/routes in sample? | Title metadata in the sample is predominantly injection/solution; no capsule/tablet titles in the stored 25 |
| OPAT-oriented title hint (title metadata only) | Title metadata suggests an injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes — setid and title bracket labeler WG CRITICAL CARE, LLC |

**Known source-selection risks**

- Only one SPL imported; 41 total SPLs reported, 16+ not in the stored sample.
- Selected SPL matches `result_position` 1 in the candidate list; this is **not canonical** and **not** a clinical preference.
- Other labelers (e.g. Baxter, Hikma, Civica) appear in the sample but were not selected.

**Unresolved before section extraction**

- Whether to track multiple injectable labeler SPLs for cefazolin.
- Whether WG Critical Care should remain the temporary working SPL for early extraction design.
- Human/legal review of `reuse_status` and any future label-derived content.

**Formulation/route check (selected SPL):** No title-metadata mismatch with typical OPAT injectable focus (injection product). **Requires human review** before treating this SPL as the working OPAT reference.

---

### Cefepime

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 16 |
| Candidates stored | 16 (full sample under cap) |
| Selected `setid` | `5fd857e5-591f-44ca-80cf-fd903660b03c` |
| Selected title | CEFEPIME INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC] |
| Selected labeler | WG CRITICAL CARE, LLC |
| Formulation/route (title only) | Title metadata suggests injectable powder for solution |
| Multiple labelers in sample? | Yes — candidate list suggests ~12 labelers |
| Multiple formulations/routes in sample? | Stored titles are injection/solution oriented in this sample |
| OPAT-oriented title hint (selected SPL; title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes |

**Known source-selection risks**

- One SPL among 16; other labelers not imported.
- Selected at `result_position` 1 — explicit `setid` was used, but position 1 must not be read as policy default.

**Unresolved before section extraction**

- Labeler choice among multiple injectable manufacturers.
- Whether multiple SPLs should be tracked per drug.

**Formulation/route check (selected SPL):** No apparent title-metadata route mismatch for injectable OPAT context. **Requires human review.**

---

### Ceftriaxone

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 51 |
| Candidates stored | 25 (capped) |
| Selected `setid` | `86ec0a92-a552-4a6d-9125-a54f95e43392` |
| Selected title | CEFTRIAXONE INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC] |
| Selected labeler | WG CRITICAL CARE, LLC |
| Formulation/route (title only) | Title metadata suggests injectable powder for solution |
| Multiple labelers in sample? | Yes — candidate list suggests ~13 labelers in sample |
| Multiple formulations/routes in sample? | Sample titles are injection-oriented; 26+ SPLs not in stored sample |
| OPAT-oriented title hint (selected SPL; title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes |

**Known source-selection risks**

- High `total_results` with partial sample — majority of SPLs not listed in `search-candidates.json`.
- Same labeler at position 1 as cefazolin/cefepime — organizational convenience only.

**Unresolved before section extraction**

- Whether ceftriaxone needs multiple labeler SPLs for OPAT.
- How to handle SPLs outside the capped sample.

**Formulation/route check (selected SPL):** No title-metadata mismatch flagged for injectable OPAT focus. **Requires human review.**

---

### Daptomycin

> **Human checkpoint (recorded):** Prior temporary working SPL was **Dapzura RT / Baxter** (`cb1283e1-35b8-425c-b338-d9ac0c7161f8`). Replaced with **generic-named injectable SPL from stored candidate sample**: Hospira, Inc. (`1957b6ce-7382-4a7b-bf02-3595948d09c6`, result_position 2). Still **one labeler/product-specific SPL**; **non-canonical**; not covering every daptomycin SPL; section extraction not authorized.

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 52 |
| Candidates stored | 25 (capped) |
| Selected `setid` | `1957b6ce-7382-4a7b-bf02-3595948d09c6` |
| Selected title | DAPTOMYCIN INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [HOSPIRA, INC.] |
| Selected labeler | HOSPIRA, INC. |
| Formulation/route (title only) | Title metadata suggests injectable lyophilized powder for solution |
| Multiple labelers in sample? | Yes — candidate list suggests ~14 labelers |
| Multiple formulations/routes in sample? | Sample is injection-heavy; branded vs generic product titles both appear |
| OPAT-oriented title hint (selected SPL; title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes — Hospira labeler; generic-named product title (not Dapzura RT) |

**Known source-selection risks**

- One imported SPL among 52 total; capped sample only.
- Human checkpoint chose first **generic-named injectable** in stored sample (position 2); position 1 was Dapzura RT (branded).
- 27+ SPLs not in capped sample; other generic-named injectables may exist outside sample.

**Unresolved before section extraction**

- Legal/reuse review; whether to import additional labeler SPLs.
- Section extraction design branch: `feature/dailymed-section-extraction-design`.

**Formulation/route check (selected SPL):** Title metadata suggests injectable lyophilized product. **Not** a clinical selection.

---

### Vancomycin

> **Human checkpoint (recorded):** Baxter **injection solution** SPL remains **temporary working injectable** source. **Route/formulation grouping** required (oral capsule vs injectable minimum). **Not canonical**; not a clinical recommendation.

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 88 |
| Candidates stored | 25 (capped) |
| Selected `setid` | `99e523d8-9bde-43cb-8434-497015e5dcbd` |
| Selected title | VANCOMYCIN HYDROCHLORIDE INJECTION, SOLUTION [BAXTER HEALTHCARE CORPORATION] |
| Selected labeler | BAXTER HEALTHCARE CORPORATION |
| Formulation/route (title only) | Title metadata suggests injection solution |
| Multiple labelers in sample? | Yes — candidate list suggests ~14 labelers |
| Multiple formulations/routes in sample? | **Yes** — candidate list suggests capsules (e.g. positions 1–2), powders for solution, injections, and other solutions in the stored 25 |
| OPAT-oriented title hint (selected SPL; title metadata only) | Selected SPL title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes |

**Known source-selection risks**

- Largest SPL count (`total_results` 88) with only 25 candidates stored.
- API sort places **capsule** products at `result_position` 1–2 — strong signal that generic drug search is route-agnostic.
- Selected SPL was chosen by **explicit `setid`** at `result_position` 4 in the current stored candidate sample — the **first entry whose title includes INJECTION** in that sample (positions 1–2 capsule, position 3 powder for solution without INJECTION in title). This is **not** the first API result and **not** a clinical recommendation.
- Human checkpoint **confirmed** Baxter injection solution as temporary working injectable SPL (`99e523d8-…`).
- **Policy direction:** model vancomycin by route/formulation group (oral capsule vs injectable minimum; powder vs injection solution TBD).
- Powders “for solution” vs “injection” titles may imply different product types; title metadata alone does not resolve clinical route.

**Unresolved before section extraction**

- Implement route/formulation groups in evidence/schema design (checkpoint direction recorded).
- Powder vs injection solution subgrouping needs additional human review.
- Legal/reuse review before any label section import.

**Formulation/route check (selected SPL):** Selected SPL title metadata suggests **injection** route. Candidate list mixes routes; grouping policy recorded. **Not** a clinical recommendation.

---

## Summary table

| Drug | total_results | Stored | Selected labeler | Title route hint (selected) | Multi-labeler sample | Multi-formulation sample | Selected OPAT title hint | Route mismatch (selected SPL) |
|------|---------------|--------|------------------|----------------------------|----------------------|---------------------------|--------------------------|------------------------------|
| cefazolin | 41 | 25 | WG Critical Care, LLC | Injection powder/solution | Yes | Mostly injection in sample | Suggests injectable | None flagged |
| cefepime | 16 | 16 | WG Critical Care, LLC | Injection powder/solution | Yes | Injection-oriented sample | Suggests injectable | None flagged |
| ceftriaxone | 51 | 25 | WG Critical Care, LLC | Injection powder/solution | Yes | Injection-oriented sample | Suggests injectable | None flagged |
| daptomycin | 52 | 25 | Hospira, Inc. (checkpoint) | Injection lyophilized | Yes | Branded + generic titles | Suggests injectable | None flagged (generic-named injectable selected) |
| vancomycin | 88 | 25 | Baxter Healthcare Corp. | Injection solution | Yes | **Capsules + injections + powders** | Selected suggests injectable | **None for selected SPL**; route grouping policy recorded |

## Recommended next step

Draft policy framework: [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md).

Suggested implementation branch after human review: **`feature/dailymed-section-extraction-design`** (design only; do not extract sections without approved policy).
