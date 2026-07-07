#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRUGS_DIR = join(ROOT, 'content', 'drugs');
const SCHEMA_DIR = join(ROOT, 'schema');
const PROJECT_CONFIG_PATH = join(ROOT, 'project.config.json');

const REQUIRED_DRUG_FILES = [
  'monograph.yaml',
  'patient.md',
  'clinician.md',
  'evidence.yaml',
  'changelog.md',
];

const PLACEHOLDER_YAML_MARKER = 'PLACEHOLDER_CLINICAL_CONTENT';
const PLACEHOLDER_MD_MARKER = '[CLINICAL REVIEW REQUIRED — NOT YET DRAFTED]';

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function readYaml(path) {
  return yaml.parse(readText(path));
}

function loadSchemas() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  addFormats(ajv);

  const monographSchema = readJson(join(SCHEMA_DIR, 'monograph.schema.json'));
  const evidenceSchema = readJson(join(SCHEMA_DIR, 'evidence.schema.json'));
  const reviewerSchema = readJson(join(SCHEMA_DIR, 'reviewer.schema.json'));

  ajv.addSchema(reviewerSchema);
  ajv.addSchema(evidenceSchema);
  ajv.addSchema(monographSchema);

  return {
    ajv,
    validateMonograph: ajv.getSchema('https://open-rx-core.example/schema/monograph.schema.json'),
    validateEvidence: ajv.getSchema('https://open-rx-core.example/schema/evidence.schema.json'),
  };
}

function validateProjectConfig() {
  if (!existsSync(PROJECT_CONFIG_PATH)) {
    fail('project.config.json is missing.');
    return;
  }

  let config;
  try {
    config = readJson(PROJECT_CONFIG_PATH);
  } catch (error) {
    fail(`project.config.json is not valid JSON: ${error.message}`);
    return;
  }

  const requiredFields = {
    coreProjectName: 'OpenRxCore',
    repoName: 'open-rx-core',
    publicProjectName: 'SourceScript',
    clinicalUseStatus: 'not_for_clinical_use',
    requireHumanReviewForPublication: true,
    audiencePrimary: 'contributors_and_builders',
    positioning: 'complements_existing_resources_not_replacement',
  };

  for (const [field, expected] of Object.entries(requiredFields)) {
    if (!(field in config)) {
      fail(`project.config.json missing required field: ${field}`);
      continue;
    }
    if (config[field] !== expected) {
      fail(`project.config.json field ${field} must equal ${JSON.stringify(expected)}; got ${JSON.stringify(config[field])}`);
    }
  }

  if (!config.audiencePrimary || String(config.audiencePrimary).trim() === '') {
    fail('project.config.json audiencePrimary must be non-empty.');
  }

  if (!config.positioning || String(config.positioning).trim() === '') {
    fail('project.config.json positioning must be non-empty.');
  }
}

function listDrugFolders() {
  if (!existsSync(DRUGS_DIR)) {
    fail(`Drugs directory missing: ${DRUGS_DIR}`);
    return [];
  }

  return readdirSync(DRUGS_DIR).filter((entry) => {
    const fullPath = join(DRUGS_DIR, entry);
    return statSync(fullPath).isDirectory();
  });
}

function validateDrugFolder(drugId, validators) {
  const drugDir = join(DRUGS_DIR, drugId);

  for (const fileName of REQUIRED_DRUG_FILES) {
    const filePath = join(drugDir, fileName);
    if (!existsSync(filePath)) {
      fail(`[${drugId}] Missing required file: ${fileName}`);
    }
  }

  const monographPath = join(drugDir, 'monograph.yaml');
  const evidencePath = join(drugDir, 'evidence.yaml');
  const patientPath = join(drugDir, 'patient.md');
  const clinicianPath = join(drugDir, 'clinician.md');

  if (!existsSync(monographPath) || !existsSync(evidencePath)) {
    return;
  }

  let monograph;
  let evidence;

  try {
    monograph = readYaml(monographPath);
  } catch (error) {
    fail(`[${drugId}] monograph.yaml parse error: ${error.message}`);
    return;
  }

  try {
    evidence = readYaml(evidencePath);
  } catch (error) {
    fail(`[${drugId}] evidence.yaml parse error: ${error.message}`);
    return;
  }

  if (!validators.validateMonograph(monograph)) {
    for (const err of validators.validateMonograph.errors ?? []) {
      fail(`[${drugId}] monograph.yaml schema: ${err.instancePath || '/'} ${err.message}`);
    }
  }

  if (!validators.validateEvidence(evidence)) {
    for (const err of validators.validateEvidence.errors ?? []) {
      fail(`[${drugId}] evidence.yaml schema: ${err.instancePath || '/'} ${err.message}`);
    }
  }

  if (monograph.clinically_usable === true) {
    fail(`[${drugId}] clinically_usable must not be true in this scaffold.`);
  }

  const isPublished = monograph.publication_status === 'published';
  const reviewStatus = monograph.review_status;
  const approvedReviewStatuses = new Set(['approved', 'published']);

  if (isPublished && !approvedReviewStatuses.has(reviewStatus)) {
    fail(
      `[${drugId}] publication_status is published but review_status is ${reviewStatus}; must be approved or published.`,
    );
  }

  if (isPublished) {
    if (!Array.isArray(monograph.reviewers) || monograph.reviewers.length < 1) {
      fail(`[${drugId}] published monograph must have at least one reviewer.`);
    }

    if (!monograph.last_reviewed) {
      fail(`[${drugId}] published monograph must have last_reviewed set.`);
    }

    if (!Array.isArray(monograph.evidence_source_ids) || monograph.evidence_source_ids.length < 1) {
      fail(`[${drugId}] published monograph must have at least one evidence_source_id.`);
    }

    if (monograph.PLACEHOLDER_CLINICAL_CONTENT === true) {
      fail(`[${drugId}] published monograph cannot contain PLACEHOLDER_CLINICAL_CONTENT: true.`);
    }

    if (existsSync(patientPath)) {
      const patientText = readText(patientPath);
      if (patientText.includes(PLACEHOLDER_MD_MARKER)) {
        fail(`[${drugId}] published monograph patient.md contains placeholder marker.`);
      }
    }

    if (existsSync(clinicianPath)) {
      const clinicianText = readText(clinicianPath);
      if (clinicianText.includes(PLACEHOLDER_MD_MARKER)) {
        fail(`[${drugId}] published monograph clinician.md contains placeholder marker.`);
      }
    }
  }

  if (Array.isArray(monograph.sections)) {
    for (const section of monograph.sections) {
      if (section?.clinical_recommendation === true) {
        const citationIds = section.citation_ids ?? [];
        if (!Array.isArray(citationIds) || citationIds.length < 1) {
          fail(
            `[${drugId}] section ${section.section_id ?? '(unknown)'} is clinical_recommendation but lacks citation_ids.`,
          );
        }
      }
    }
  }

  if (isPublished) {
    const monographText = readText(monographPath);
    if (monographText.includes(`${PLACEHOLDER_YAML_MARKER}: true`)) {
      fail(`[${drugId}] published monograph cannot contain PLACEHOLDER_CLINICAL_CONTENT: true.`);
    }
  }

  if (!isPublished && monograph.PLACEHOLDER_CLINICAL_CONTENT !== true) {
    warn(`[${drugId}] draft monograph does not set PLACEHOLDER_CLINICAL_CONTENT: true (expected for scaffold placeholders).`);
  }
}

function main() {
  console.log('OpenRxCore validation');
  console.log('=====================');

  const validators = loadSchemas();
  validateProjectConfig();

  const drugFolders = listDrugFolders();
  if (drugFolders.length === 0) {
    fail('No drug folders found under content/drugs/.');
  }

  console.log(`Found ${drugFolders.length} drug folder(s): ${drugFolders.join(', ')}`);

  for (const drugId of drugFolders) {
    validateDrugFolder(drugId, validators);
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) {
      console.log(`  ⚠ ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const error of errors) {
      console.log(`  ✗ ${error}`);
    }
    console.log(`\nValidation failed with ${errors.length} error(s).`);
    process.exit(1);
  }

  console.log('\nValidation passed.');
  process.exit(0);
}

main();
