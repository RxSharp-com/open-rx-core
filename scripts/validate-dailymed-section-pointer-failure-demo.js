#!/usr/bin/env node

/**
 * Section pointer schema + fixture validation failure demo (fictional fixtures only).
 * Not part of main npm run validate.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { validateSectionPointerFile } from './lib/section-pointer-rules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURES_DIR = join(ROOT, 'fixtures', 'dailymed-section-pointers');
const SCHEMA_PATH = join(ROOT, 'schema', 'dailymed-section-pointer.schema.json');

function loadSectionPointerSchemaValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
  ajv.addSchema(schema);
  return ajv.getSchema('https://open-rx-core.example/schema/dailymed-section-pointer.schema.json');
}

const validateSchema = loadSectionPointerSchemaValidator();

function runScenario(name, fixtureFile, expectFailure) {
  console.log(`\nScenario: ${name}`);
  console.log('-'.repeat(name.length + 11));

  const errors = [];
  const fail = (message) => errors.push(message);
  const pointerFile = yaml.parse(readFileSync(join(FIXTURES_DIR, fixtureFile), 'utf8'));

  validateSectionPointerFile(
    pointerFile,
    `fixtures/dailymed-section-pointers/${fixtureFile}`,
    fail,
    {
      validateSchema: (data) => validateSchema(data),
      validateSchemaErrors: () => validateSchema.errors,
    },
  );

  if (expectFailure) {
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

  if (errors.length > 0) {
    console.log('Unexpected failure:');
    for (const error of errors) {
      console.log(`  ✗ ${error}`);
    }
    return false;
  }

  console.log('Expected pass.');
  return true;
}

console.log('OpenRxCore DailyMed section pointer failure demo');
console.log('================================================');
console.log(`Schema: schema/dailymed-section-pointer.schema.json`);
console.log('Future placement: data/derived/dailymed/{drug_id}/section-pointers.yaml');

let ok = true;
ok = runScenario('valid fictional example pointers', 'example-section-pointers.yaml', false) && ok;
ok =
  runScenario(
    'pointer file contains forbidden body_text field',
    'failure-section-pointer-with-body-text.yaml',
    true,
  ) && ok;
ok =
  runScenario(
    'pointer contains_text true rejected',
    'failure-section-pointer-contains-text-true.yaml',
    true,
  ) && ok;
ok =
  runScenario(
    'canonical_status canonical rejected',
    'failure-section-pointer-canonical.yaml',
    true,
  ) && ok;
ok =
  runScenario(
    'provisional max string length heuristic',
    'failure-section-pointer-long-string.yaml',
    true,
  ) && ok;
ok =
  runScenario(
    'initial OPAT drug_id rejected in fixtures',
    'failure-section-pointer-real-drug-name.yaml',
    true,
  ) && ok;

if (!ok) {
  console.log('\nSection pointer demo did not behave as expected.');
  process.exit(1);
}

console.log('\nAll section pointer demo scenarios behaved as expected.');
process.exit(0);
