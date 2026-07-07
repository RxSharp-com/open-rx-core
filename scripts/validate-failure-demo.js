#!/usr/bin/env node

/**
 * Deliberate failure demonstration for OpenRxCore safety gates.
 * Temporarily marks vancomycin as published without reviewers, runs validation,
 * then restores the original monograph.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import yaml from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MONOGRAPH_PATH = join(ROOT, 'content', 'drugs', 'vancomycin', 'monograph.yaml');

const originalText = readFileSync(MONOGRAPH_PATH, 'utf8');
const monograph = yaml.parse(originalText);

monograph.publication_status = 'published';
monograph.review_status = 'approved';
monograph.reviewers = [];
monograph.last_reviewed = null;
monograph.evidence_source_ids = [];

writeFileSync(MONOGRAPH_PATH, yaml.stringify(monograph));

console.log('OpenRxCore deliberate failure test');
console.log('==================================');
console.log('Temporarily marked vancomycin monograph as published without reviewers.\n');

const result = spawnSync('node', ['scripts/validate.js'], {
  cwd: ROOT,
  encoding: 'utf8',
});

process.stdout.write(result.stdout);
process.stderr.write(result.stderr);

writeFileSync(MONOGRAPH_PATH, originalText);

console.log('\nRestored vancomycin monograph.yaml to original scaffold state.');

process.exit(result.status ?? 1);
