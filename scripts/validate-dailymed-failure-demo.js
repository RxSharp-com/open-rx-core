#!/usr/bin/env node

/**
 * DailyMed metadata validation failure demonstrations.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDailyMedCandidateList } from './lib/evidence-rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES_DIR = join(ROOT, 'fixtures', 'dailymed');

function runCandidateScenario(name, fixtureFile) {
  console.log(`\nScenario: ${name}`);
  console.log('-'.repeat(name.length + 11));

  const errors = [];
  const fail = (message) => errors.push(message);
  const candidateList = JSON.parse(readFileSync(join(FIXTURES_DIR, fixtureFile), 'utf8'));

  validateDailyMedCandidateList(
    candidateList,
    `fixtures/dailymed/${fixtureFile}`,
    fail,
  );

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

console.log('OpenRxCore DailyMed metadata failure demo');
console.log('=========================================');

const scenarios = [
  [
    'candidate list contains forbidden body_text field',
    'failure-candidate-body-fields.json',
  ],
];

let allFailedAsExpected = true;
for (const [name, fixture] of scenarios) {
  const failed = runCandidateScenario(name, fixture);
  allFailedAsExpected = allFailedAsExpected && failed;
}

if (!allFailedAsExpected) {
  console.log('\nDailyMed metadata failure demo did not produce expected failures.');
  process.exit(1);
}

console.log('\nAll DailyMed metadata failure scenarios behaved as expected.');
process.exit(0);
