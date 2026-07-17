# DailyMed source-selection review (initial OPAT drugs)

Structured review of **metadata already committed** in OpenRxCore for the five initial OPAT drugs. This is a **source-selection review only** — not clinical review, not label section extraction, and not a determination of which SPL is “best” for care.

See also: [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md) · [dailymed-source-normalization.md](dailymed-source-normalization.md) · [dailymed-opat-metadata-expansion.md](dailymed-opat-metadata-expansion.md)

**OpenRxCore is not clinically usable.** Title-based OPAT relevance notes below use cautious phrasing only (`title metadata suggests`, `requires human review`, `not a clinical selection`, `not canonical`).

## Cross-cutting source-selection problems

| Problem | What the metadata shows | Risk |
|--------|-------------------------|------|
| Many SPLs per generic name | `total_results` ranges from 16 (cefepime) to 88 (vancomycin) | A single imported SPL cannot represent the whole drug |
| Capped candidate samples | 25-candidate cap for drugs with `total_results` > 25 | Unsampled SPLs may include other labelers, routes, or products |
| API sort order | `result_position` 1 varies by drug (e.g. vancomycin capsules at positions 1–2) | First search result is never canonical; easy to mis-import without explicit `setid` |
| Multiple labelers | 12–15 distinct labelers in each 16–25 candidate sample | Labeler/product-specific labeling may differ; reconciliation undefined |
| WG Critical Care at position 1 | Cefazolin, cefepime, and ceftriaxone selected SPLs share the same labeler and `result_position` 1 in sample | Convenience alignment across drugs is **not** a clinical or policy endorsement |
| Product-branded SPL titles | Daptomycin selected SPL title includes “DAPZURA RT” | Product-specific SPL vs generic-named SPL tracking is unresolved |
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
| OPAT relevance (title metadata only) | Title metadata suggests an injectable product; **not a clinical selection** |
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
| OPAT relevance (title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
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
| OPAT relevance (title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
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

| Field | Value |
|-------|--------|
| DailyMed `total_results` | 52 |
| Candidates stored | 25 (capped) |
| Selected `setid` | `cb1283e1-35b8-425c-b338-d9ac0c7161f8` |
| Selected title | DAPZURA RT (DAPTOMYCIN) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [BAXTER HEALTHCARE CORPORATION] |
| Selected labeler | BAXTER HEALTHCARE CORPORATION |
| Formulation/route (title only) | Title metadata suggests injectable lyophilized powder for solution; product name “DAPZURA RT” in title |
| Multiple labelers in sample? | Yes — candidate list suggests ~14 labelers |
| Multiple formulations/routes in sample? | Sample is injection-heavy; branded vs generic product titles both appear |
| OPAT relevance (title metadata only) | Title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes — branded product line in title, Baxter labeler |

**Known source-selection risks**

- Selected SPL is **product-branded** (DAPZURA RT) while other candidates use generic “DAPTOMYCIN” titling — not representative of all daptomycin SPLs.
- `result_position` 1 in sample; explicit `setid` selection does not resolve branded vs generic tracking policy.
- 27+ SPLs not in capped sample.

**Unresolved before section extraction**

- Whether OPAT tracking should use a generic-named injectable SPL, a branded SPL, or multiple SPLs.
- Human decision on branded product SPL as working source for extraction design.

**Formulation/route check (selected SPL):** No oral/topical title-metadata mismatch; injectable lyophilized. **Product-line branding** is a source-selection ambiguity, not a route mismatch. **Requires human review** — not automatic re-selection.

---

### Vancomycin

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
| OPAT relevance (title metadata only) | Selected SPL title metadata suggests injectable product; **not a clinical selection** |
| Selected SPL clearly labeler/product-specific? | Yes |

**Known source-selection risks**

- Largest SPL count (`total_results` 88) with only 25 candidates stored.
- API sort places **capsule** products at `result_position` 1–2 — strong signal that generic drug search is route-agnostic.
- Selected SPL was chosen by **explicit setid** at `result_position` 4 (injection), not the first API result — good metadata practice, but human review still needed to confirm working SPL among many injectable labelers.
- Powders “for solution” vs “injection” titles may imply different product types; title metadata alone does not resolve clinical route.

**Unresolved before section extraction**

- Whether vancomycin tracking must split **oral vs injectable** (and possibly IV vs other parenteral) SPL groups.
- Human decision: is Baxter injection `99e523d8-…` the appropriate **temporary working SPL** for OPAT-oriented extraction design, among 11+ injection-titled entries in the sample alone?
- Re-selection question if policy favors a different injectable labeler or formulation subgroup — **human decision only** (this review does not change `setid`).

**Formulation/route check (selected SPL):** The **currently selected** SPL title metadata suggests **injection** route — **not** flagged as an oral/topical mismatch for OPAT based on title alone. **Caution:** the **candidate list** still shows capsule-heavy API ordering; route/formulation policy for the drug overall **requires human review** before section extraction. This is **not** a directive to re-select silently; flagged for human review in [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md).

---

## Summary table

| Drug | total_results | Stored | Selected labeler | Title route hint (selected) | Multi-labeler sample | Multi-formulation sample | Selected OPAT title hint | Route mismatch (selected SPL) |
|------|---------------|--------|------------------|----------------------------|----------------------|---------------------------|--------------------------|------------------------------|
| cefazolin | 41 | 25 | WG Critical Care, LLC | Injection powder/solution | Yes | Mostly injection in sample | Suggests injectable | None flagged |
| cefepime | 16 | 16 | WG Critical Care, LLC | Injection powder/solution | Yes | Injection-oriented sample | Suggests injectable | None flagged |
| ceftriaxone | 51 | 25 | WG Critical Care, LLC | Injection powder/solution | Yes | Injection-oriented sample | Suggests injectable | None flagged |
| daptomycin | 52 | 25 | Baxter (Dapzura RT) | Injection lyophilized | Yes | Branded + generic titles | Suggests injectable | None flagged; branding ambiguity |
| vancomycin | 88 | 25 | Baxter Healthcare Corp. | Injection solution | Yes | **Capsules + injections + powders** | Selected suggests injectable | **None for selected SPL**; list route mix |

## Recommended next step

Draft policy framework: [dailymed-source-selection-policy-draft.md](dailymed-source-selection-policy-draft.md).

Suggested implementation branch after human review: **`feature/dailymed-section-extraction-design`** (design only; do not extract sections without approved policy).
