# Changelog — daptomycin

## 2026-07-17 — DailyMed human source-selection checkpoint (metadata only)

- **Change type:** evidence_source_metadata
- **Clinical change:** no
- **Summary:** Human source-selection checkpoint applied. Temporary working DailyMed SPL metadata source changed from Dapzura RT / Baxter (`cb1283e1-35b8-425c-b338-d9ac0c7161f8`) to a generic-named injectable SPL from the stored candidate sample: Hospira, Inc. (`1957b6ce-7382-4a7b-bf02-3595948d09c6`). Selection used existing `data/raw/dailymed/daptomycin/search-candidates.json` only; no new label body text, XML, or HTML was fetched. Non-canonical; not a clinical selection. `evidence_status` remains `sources_imported`. `reuse_status` remains `unknown_requires_review`. Section extraction remains unauthorized. `package.json` `fetch:dailymed:daptomycin` script setid updated to match evidence (metadata-only explicit setid fetch).

## 0.0.0-scaffold — 2026-07-07

- **Change type:** scaffold
- **Clinical change:** no
- **Summary:** Initial drug folder scaffold created. No clinical content added.
