# AGENTS.md

## Cursor Cloud specific instructions

`open-rx-core` (OpenRxCore) is a Node.js (ESM) content/schema **validation tooling** project — there is no server, UI, or build step. It validates the medication `content/`, `schema/`, and `project.config.json` scaffold. Standard commands are documented in `README.md`.

Non-obvious notes for future agents:

- Node 22 with npm is required. Dependencies are refreshed automatically on startup via `npm install` (dev dependencies only: `ajv`, `ajv-formats`, `yaml`).
- There is **no lint step and no build step**. The only npm scripts are `npm run validate` (the primary check, must exit `0`) and `npm run validate:failure-demo`.
- `npm run validate:failure-demo` **exits with code `1` by design**: it temporarily marks a monograph as published without reviewers to prove the safety gate rejects it, then restores the file. A non-zero exit here is success, not a failure.
- `node_modules/` is git-ignored; do not commit it.
