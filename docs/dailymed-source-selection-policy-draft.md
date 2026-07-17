# DailyMed source-selection policy (draft)

**Status:** Draft framework for contributor and human review. **Not an approved organizational policy.** OpenRxCore remains **not for clinical use**.

This draft proposes conservative rules for choosing and documenting DailyMed SPL sources **before** any label section extraction or clinical synthesis.

Related: [dailymed-source-selection-review.md](dailymed-source-selection-review.md) · [dailymed-source-normalization.md](dailymed-source-normalization.md) · [dailymed-opat-metadata-expansion.md](dailymed-opat-metadata-expansion.md)

---

## Purpose

Guide future DailyMed source selection so that:

- SPLs stay **labeler/product-specific** and **non-canonical**
- Route/formulation ambiguity is **documented**, not hidden
- OPAT-oriented work can identify likely injectable SPLs from **title metadata only**, without claiming clinical appropriateness
- Human clinical and legal review gates exist **before** scaling extraction

---

## Core principles (proposed)

1. **DailyMed SPLs are labeler/product-specific.** Each `setid` is one SPL submission, not “the drug label.”

2. **Generic drug names may map to many SPLs.** Search by `drug_name` can return dozens of labelers, products, and routes.

3. **First search result is never canonical.** API `result_position` 1 must not drive imports without an explicit `setid` decision and documentation.

4. **Candidate lists are metadata-only and capped.** Store setid, title, labeler, dates, URLs, and `total_results`; cap samples consistently (e.g. 25); record when more SPLs exist.

5. **Selected SPLs are chosen by explicit `setid`.** Fetch/import tooling must require `--setid` (or equivalent human-recorded choice), not silent `pagesize=1` behavior.

6. **Selected SPLs must be documented as non-canonical.** `notes`, `known_gaps`, and `audit_notes` must state one labeler/product SPL, not the whole generic drug.

7. **Source titles must include labeler when available.** If labeler is unknown, titles must say `labeler unknown` per normalization rules.

8. **Source records must include `identifiers.setid`.** Required for validation and traceability.

9. **Route/formulation ambiguity must be documented.** When candidate titles suggest capsules, injections, powders, topical, etc., record that in gaps and policy review — especially for drugs like vancomycin.

10. **Multiple formulation/route groups may require separate tracking.** For generic drugs with oral and parenteral SPLs, a single SPL per `drug_id` may be insufficient; model **route/formulation groupings** in evidence design before extraction.

11. **OPAT use cases and title metadata.** Title keywords (e.g. INJECTION, CAPSULE) may **suggest** which SPLs are worth human consideration for outpatient parenteral antimicrobial therapy contexts. This is **not clinical review** and **not** a basis for automated preference.

12. **Prefer multiple SPL tracking over one canonical SPL.** For generic drugs, tracking several explicit SPLs (by labeler and/or route group) is likely safer than designating one canonical label.

13. **Human-reviewed policy required before section extraction.** No bulk extraction of dosing, warnings, or counseling text until source-selection and reuse questions are answered.

14. **`reuse_status` stays `unknown_requires_review` by default.** Change only after documented human/legal review with verifiable `license_note` when asserting broader reuse.

15. **No DailyMed SPL is a complete drug monograph.** SPL text supports regulatory source evidence; OpenRxCore monographs require separate human-reviewed synthesis.

---

## Proposed workflow (before extraction)

1. Run metadata **list** mode; store `search-candidates.json` with `total_results`.
2. Review candidate titles for labeler diversity and route/formulation keywords (**title metadata only**).
3. Record source-selection risks and unresolved questions (see review doc template).
4. If importing a working SPL, choose **`setid` explicitly**; write `fetch-metadata.json`; map one source record in `evidence.yaml` with non-canonical disclosure.
5. Escalate to human review when: high `total_results`, route mixing, branded product titles, or OPAT relevance is unclear from metadata alone.
6. Do **not** approve evidence packets or assert `public_domain` in this phase.

---

## Policy Questions Requiring Human Review

These questions must be answered (clinical, editorial, and legal stakeholders) before scaling DailyMed section extraction:

### Scope and cardinality

- Should OpenRxCore track **multiple DailyMed SPLs per generic drug** in `evidence.yaml`?
- Should **route/formulation-specific label groups** be modeled separately (e.g. vancomycin oral vs injectable SPL sets)?
- Should **one SPL** be designated as a **temporary working SPL** for early extraction **design** only — and under what criteria?

### Selection criteria

- How should **differences between labelers** be reconciled when titles and sections differ?
- What should count as **sufficient evidence** that a source is **OPAT-relevant** (beyond injectable title metadata)?
- For **daptomycin**, should a **branded** SPL (DAPZURA RT) or a **generic-named** injectable SPL be the working source — or both?

### Vancomycin and route mixing

- The vancomycin candidate sample mixes **capsule**, **injection**, and **powder for solution** titles; API order favors capsules. The **currently selected** Baxter **injection** SPL (`99e523d8-9bde-43cb-8434-497015e5dcbd`) was chosen by explicit `setid`. **Does a human reviewer affirm this as the temporary working injectable SPL**, or should a different injectable `setid` be selected by human decision? (This review does **not** re-select.)

### Reuse and content

- How should **`reuse_status`** and **`license_note`** be reviewed for each concrete SPL?
- Should DailyMed label-derived content be **source evidence only**, or can **short generated summaries** be created after review — and who approves?

### Cross-drug patterns

- Three drugs share **WG Critical Care, LLC** at `result_position` 1 in metadata samples. Should policy **avoid** defaulting to the same labeler across OPAT drugs without per-drug human sign-off?

### Cefazolin pilot legacy

- Cefazolin evidence still reflects early pilot wording in places. Should packet-level gaps be normalized to **explicit setid** language without implying clinical preference?

---

## What this draft does not do

- Approve any SPL as canonical or clinically preferred
- Authorize label section extraction or monograph drafting
- Change `reuse_status` or approve evidence packets
- Add new drugs or fetch new label body content

---

## Suggested next branch

After human review of this draft: **`feature/dailymed-section-extraction-design`** — technical design for how section pointers or extracts would be stored, gated by policy sign-off (implementation still metadata-safe until approved).
