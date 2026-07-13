#!/usr/bin/env node

/**
 * DailyMed metadata tooling for the cefazolin pilot (metadata only).
 *
 * Modes:
 *   list   — write search-candidates.json (metadata sample, capped)
 *   fetch  — write fetch-metadata.json for an explicit setid
 *
 * Does NOT fetch label XML/HTML/body text. No unattended execution.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DRUG_NAME = 'cefazolin';
const CANDIDATE_CAP = 25;
const PILOT_SETID = '1999084a-124c-45f9-801f-416a1b942c96';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function usage() {
  console.log(`Usage:
  node scripts/fetch-dailymed-single-drug.js list
  node scripts/fetch-dailymed-single-drug.js fetch --setid <uuid>

list   Metadata-only DailyMed search candidate sample (max ${CANDIDATE_CAP} results).
fetch  Metadata-only record for one explicit SPL setid (preferred import pattern).

Environment:
  DAILYMED_SETID  Optional setid for fetch when --setid is omitted (pilot default preserved).`);
}

function parsePublishedDate(publishedDate) {
  if (!publishedDate || typeof publishedDate !== 'string') {
    return null;
  }
  const parsed = new Date(publishedDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function extractLabelerFromTitle(title) {
  const match = title?.match(/\[([^\]]+)\]\s*$/);
  return match ? match[1].trim() : null;
}

function dailymedUrl(setid) {
  return `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setid}`;
}

async function fetchJson(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    fail(`Network request failed for ${url}: ${error.message}`);
  }

  if (!response.ok) {
    fail(`DailyMed API returned HTTP ${response.status} for ${url}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    fail(`DailyMed API response was not valid JSON: ${error.message}`);
  }

  if (!payload || typeof payload !== 'object') {
    fail(`DailyMed API response was not a JSON object for ${url}`);
  }

  return payload;
}

function normalizeCandidate(record, resultPosition) {
  if (!record?.setid) {
    return null;
  }
  return {
    setid: record.setid,
    title: record.title,
    spl_version: record.spl_version ?? null,
    published_date: record.published_date ?? null,
    published_date_iso: parsePublishedDate(record.published_date),
    labeler: extractLabelerFromTitle(record.title),
    dailymed_url: dailymedUrl(record.setid),
    result_position: resultPosition,
  };
}

async function runList() {
  const query = `drug_name=${DRUG_NAME}`;
  const searchUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?${query}&pagesize=${CANDIDATE_CAP}`;

  console.log(`DailyMed list mode: metadata-only search for ${DRUG_NAME} (cap ${CANDIDATE_CAP})...`);
  console.warn(
    'List mode does not select a canonical label. result_position is API sort order only.',
  );

  const searchResult = await fetchJson(searchUrl);
  const records = searchResult?.data;

  if (!Array.isArray(records) || records.length === 0) {
    fail(`No DailyMed SPL records returned for ${query}.`);
  }

  const totalResults = searchResult?.metadata?.total_elements ?? records.length;
  const candidates = records
    .map((record, index) => normalizeCandidate(record, index + 1))
    .filter(Boolean);

  const output = {
    query,
    fetched_at: new Date().toISOString(),
    total_results: totalResults,
    candidates_returned: candidates.length,
    candidates_capped_at: CANDIDATE_CAP,
    note:
      totalResults > candidates.length
        ? 'Additional candidates may exist beyond this metadata sample. First-result position is not canonical.'
        : 'Metadata-only candidate sample.',
    api_search_url: searchUrl,
    candidates,
  };

  const outDir = join(ROOT, 'data', 'raw', 'dailymed', DRUG_NAME);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'search-candidates.json');
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Wrote ${candidates.length} candidate(s); total_results=${totalResults}.`);
  console.log(`  file: ${outPath}`);
  if (candidates[0]) {
    console.log(`  first result_position=1 setid: ${candidates[0].setid}`);
    console.log('  (position 1 is not a canonical source selection.)');
  }
}

async function runFetch(setid) {
  if (!setid) {
    fail('fetch mode requires --setid <uuid> or DAILYMED_SETID environment variable.');
  }

  const verifyUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?setid=${encodeURIComponent(setid)}`;

  console.log(`DailyMed fetch mode: explicit setid ${setid} (metadata only)...`);
  console.warn(
    'Fetch uses explicit setid selection. Do not treat any SPL as the canonical whole-drug label.',
  );

  const verifyResult = await fetchJson(verifyUrl);
  const verified = verifyResult?.data?.[0];

  if (!verified?.setid) {
    fail(`Unable to load SPL metadata for setid ${setid}.`);
  }

  const accessedDate = new Date().toISOString().slice(0, 10);
  const labeler = extractLabelerFromTitle(verified.title);

  const output = {
    pilot: 'dailymed-single-drug',
    source_family: 'dailymed',
    drug_name: DRUG_NAME,
    selection_method: 'explicit_setid',
    selected_setid: verified.setid,
    fetched_at: new Date().toISOString(),
    accessed_date: accessedDate,
    selection_warning:
      'SPL/setid-specific metadata only. Not a canonical whole-drug label for generic drugs.',
    api_verify_url: verifyUrl,
    selected_spl: {
      setid: verified.setid,
      title: verified.title,
      spl_version: verified.spl_version ?? null,
      published_date: verified.published_date ?? null,
      published_date_iso: parsePublishedDate(verified.published_date),
      labeler,
      dailymed_url: dailymedUrl(verified.setid),
    },
    notes: [
      'Metadata only. No SPL XML/HTML or label section text stored.',
      'Imported via explicit setid selection (preferred pattern).',
    ],
  };

  const outDir = join(ROOT, 'data', 'raw', 'dailymed', DRUG_NAME);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'fetch-metadata.json');
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log('DailyMed metadata fetch complete.');
  console.log(`  setid: ${output.selected_spl.setid}`);
  console.log(`  title: ${output.selected_spl.title}`);
  if (labeler) {
    console.log(`  labeler: ${labeler}`);
  }
  console.log(`  written: ${outPath}`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();

  if (!command || command === '--help' || command === '-h') {
    usage();
    process.exit(command ? 0 : 1);
  }

  let setid = process.env.DAILYMED_SETID || null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--setid') {
      setid = args[i + 1];
      i += 1;
    }
  }

  return { command, setid };
}

async function main() {
  const { command, setid } = parseArgs(process.argv.slice(2));

  if (command === 'list') {
    await runList();
    return;
  }

  if (command === 'fetch') {
    await runFetch(setid || PILOT_SETID);
    return;
  }

  fail(`Unknown command "${command}". Use list or fetch.`);
}

main();
