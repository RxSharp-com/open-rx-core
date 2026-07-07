#!/usr/bin/env node

/**
 * Fetch minimal DailyMed SPL metadata for a single drug (cefazolin pilot).
 * Metadata only — no label text, HTML, or XML.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DRUG_NAME = 'cefazolin';
const PAGE_SIZE = 1;
const SEARCH_URL = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?drug_name=${encodeURIComponent(DRUG_NAME)}&pagesize=${PAGE_SIZE}`;

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
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

  return payload;
}

async function main() {
  console.log(`Fetching DailyMed SPL metadata for ${DRUG_NAME} (pagesize=${PAGE_SIZE})...`);

  const searchResult = await fetchJson(SEARCH_URL);
  const records = searchResult?.data;

  if (!Array.isArray(records) || records.length === 0) {
    fail(`No DailyMed SPL records returned for drug_name=${DRUG_NAME}.`);
  }

  const record = records[0];
  if (!record?.setid) {
    fail('DailyMed search result missing setid.');
  }

  const verifyUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?setid=${encodeURIComponent(record.setid)}`;
  const verifyResult = await fetchJson(verifyUrl);
  const verified = verifyResult?.data?.[0];

  if (!verified?.setid) {
    fail(`Unable to verify setid ${record.setid} via DailyMed API.`);
  }

  const accessedDate = new Date().toISOString().slice(0, 10);
  const output = {
    pilot: 'dailymed-single-drug',
    drug_name: DRUG_NAME,
    fetched_at: new Date().toISOString(),
    accessed_date: accessedDate,
    api_search_url: SEARCH_URL,
    api_verify_url: verifyUrl,
    selected_spl: {
      setid: verified.setid,
      title: verified.title,
      spl_version: verified.spl_version,
      published_date: verified.published_date,
      published_date_iso: parsePublishedDate(verified.published_date),
      dailymed_url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${verified.setid}`,
    },
    notes: [
      'Metadata only. No SPL XML/HTML or label section text stored.',
      'Single-record pilot using pagesize=1 search result.',
    ],
  };

  const outDir = join(ROOT, 'data', 'raw', 'dailymed', DRUG_NAME);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'fetch-metadata.json');
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log('DailyMed metadata fetch complete.');
  console.log(`  setid: ${output.selected_spl.setid}`);
  console.log(`  title: ${output.selected_spl.title}`);
  console.log(`  written: ${outPath}`);
}

main();
