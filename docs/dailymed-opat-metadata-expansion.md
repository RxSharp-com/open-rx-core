# DailyMed OPAT metadata expansion

This branch expands **metadata-only** DailyMed source coverage from the cefazolin pilot to the remaining initial OPAT drugs:

- cefepime
- ceftriaxone
- daptomycin
- vancomycin

See also: [dailymed-source-normalization.md](dailymed-source-normalization.md) · [dailymed-pilot.md](dailymed-pilot.md) · [evidence-model.md](evidence-model.md)

**OpenRxCore is not clinically usable.** This work imports regulatory-label **metadata** only. No clinical synthesis, dosing guidance, warnings summaries, or monograph content was created.

## Purpose

Establish a conservative, repeatable pattern for:

1. Metadata-only DailyMed search candidate lists (`search-candidates.json`)
2. At most one explicitly selected SPL per drug in `evidence.yaml`
3. Draft/needs_review evidence packets that require human review

## Candidate lists (metadata only)

Each drug has:

`data/raw/dailymed/{drug_id}/search-candidates.json`

| Property | Rule |
|----------|------|
| Content | Metadata only: setid, title, spl_version, published_date, labeler, dailymed_url, result_position |
| Cap | 25 candidates uniformly (even when `total_results` is higher) |
| `total_results` | Recorded when returned by the DailyMed API |
| Prohibited | Label body text, XML, HTML, dosing, warnings, adverse reactions, counseling |

`result_position` reflects API sort order only — **not** canonical ranking or clinical preference.

## Selected SPLs (labeler/product/SPL-specific)

For each drug, at most **one** SPL was imported into `evidence.yaml` using **explicit `setid` selection** via:

```bash
node scripts/fetch-dailymed-single-drug.js fetch --drug <drug_id> --setid <uuid>
```

Selected SPLs are:

- **Pilot metadata sources only**
- **Not canonical** whole-drug labels
- **Not clinically reviewed** for formulation, route, or labeler preference

`reuse_status` remains `unknown_requires_review` unless human/legal review documents otherwise.

## Script usage

```bash
# List metadata candidates (cap 25)
node scripts/fetch-dailymed-single-drug.js list --drug cefepime

# Fetch one explicit SPL (metadata only)
node scripts/fetch-dailymed-single-drug.js fetch --drug cefepime --setid <uuid>
```

Supported `drug_id` values: `cefazolin`, `cefepime`, `ceftriaxone`, `daptomycin`, `vancomycin`.

Package scripts are available for each drug (see `package.json`).

## What this branch does not do

- Create `patient.md` or `clinician.md` content
- Import label XML/HTML or section text
- Approve evidence packets
- Select a canonical reference SPL per generic drug
- Assert that one labeler represents all formulations or routes

## Unresolved questions before scaling further

Recommended next branch: **`feature/dailymed-source-selection-review`**

Human review is needed before scaling:

1. **Which SPL(s) per drug** should be tracked for OPAT (route, formulation, labeler)?
2. **Whether multiple SPLs** per generic drug should be imported
3. **Whether any SPL** may be designated canonical after explicit policy review
4. **`reuse_status` and `license_note`** on concrete SPL examples
5. **How to compare** SPL metadata across labelers without implying clinical equivalence

## Validation

`npm run validate` checks DailyMed source scoping rules, disallows canonical SPL descriptions, rejects approved DailyMed packets in this phase, and scans candidate list files for forbidden label-body fields.

Failure demos:

- `npm run validate:evidence-failure-demo`
- `npm run validate:dailymed-failure-demo`
