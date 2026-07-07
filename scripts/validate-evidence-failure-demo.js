#!/usr/bin/env node

/**
 * Evidence-model failure demonstrations for OpenRxCore validation safety gates.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'yaml';
import { validateEvidenceRules } from './lib/evidence-rules.js';

const PILOT_VALIDATION_OPTIONS = {
  disallowApprovedPackets: true,
  disallowMonographCandidates: true,
  maxFieldLength: 320,
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES_DIR = join(ROOT, 'fixtures', 'evidence');

function loadValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  const evidenceSchema = JSON.parse(
    readFileSync(join(ROOT, 'schema', 'evidence.schema.json'), 'utf8'),
  );
  ajv.addSchema(evidenceSchema);
  return ajv.getSchema('https://open-rx-core.example/schema/evidence.schema.json');
}

function runScenario(name, fixtureFile) {
  console.log(`\nScenario: ${name}`);
  console.log('-'.repeat(name.length + 11));

  const errors = [];
  const fail = (message) => errors.push(message);
  const evidence = yaml.parse(readFileSync(join(FIXTURES_DIR, fixtureFile), 'utf8'));
  const drugId = evidence.drug_id;
  const validateEvidence = loadValidator();

  if (!validateEvidence(evidence)) {
    for (const err of validateEvidence.errors ?? []) {
      fail(`schema: ${err.instancePath || '/'} ${err.message}`);
    }
  }

  validateEvidenceRules(evidence, drugId, fail, PILOT_VALIDATION_OPTIONS);

  if (errors.length === 0) {
    console.log('Unexpected pass — scenario should have failed validation.');
    return false;
  }

  console.log('Expected failure:');
  for (const error of errors) {
    console.log(`  ✗ ${error}`);
  }
  return true;
}

console.log('OpenRxCore evidence failure demo');
console.log('================================');

const scenarios = [
  [
    'clinical_claim without citation_id',
    'failure-clinical-claim-without-citation.yaml',
  ],
  [
    'citation references missing source_id',
    'failure-citation-missing-source.yaml',
  ],
  [
    'approved packet uses unknown_requires_review source',
    'failure-approved-unknown-reuse.yaml',
  ],
  [
    'DailyMed approved packet with unknown_requires_review source',
    'failure-approved-dailymed-unknown-reuse.yaml',
  ],
  [
    'long copied label text in claim_summary',
    'failure-long-copied-label-text.yaml',
  ],
  [
    'recommendation_impact direct without level_3 or level_4',
    'failure-direct-recommendation-impact.yaml',
  ],
];

let allFailedAsExpected = true;
for (const [name, fixture] of scenarios) {
  const failed = runScenario(name, fixture);
  allFailedAsExpected = allFailedAsExpected && failed;
}

if (!allFailedAsExpected) {
  console.log('\nEvidence failure demo did not produce expected failures.');
  process.exit(1);
}

console.log('\nAll evidence failure scenarios behaved as expected.');
process.exit(0);
