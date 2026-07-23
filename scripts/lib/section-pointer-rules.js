/**
 * Section pointer validation for fictional fixtures and failure demos.
 *
 * FIXTURE/DEMO SCOPE ONLY — invoked by validate-dailymed-section-pointer-failure-demo.js.
 * Not imported by scripts/validate.js. Real drug files under
 * data/derived/dailymed/{drug_id}/section-pointers.yaml are not validated on main yet.
 */

/** Initial OPAT drugs — fixture validation rejects these drug_id values (readiness guard). */
export const INITIAL_OPAT_DRUG_IDS = [
  'cefazolin',
  'cefepime',
  'ceftriaxone',
  'daptomycin',
  'vancomycin',
];

export const SECTION_POINTER_FORBIDDEN_FIELDS = [
  'body_text',
  'label_text',
  'full_text',
  'section_text',
  'extracted_text',
  'summary_text',
  'generated_summary',
  'label_xml',
  'label_html',
  'html',
  'xml',
  'dosing_text',
  'warnings_text',
  'adverse_reactions_text',
  'counseling_text',
  'patient_text',
  'clinician_text',
];

/** Provisional heuristic cap — not paraphrase/copyright safety. */
export const DEFAULT_PROVISIONAL_MAX_STRING_LENGTH = 320;

function collectForbiddenFields(value, path, forbiddenFields, matches) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectForbiddenFields(item, `${path}[${index}]`, forbiddenFields, matches);
    });
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (forbiddenFields.includes(key)) {
      matches.push(childPath);
    }
    collectForbiddenFields(child, childPath, forbiddenFields, matches);
  }
}

/** Heuristic only: catches accidental large pastes; does not detect paraphrased label text. */
function collectStringsExceedingProvisionalMaxLength(value, path, maxLen, matches) {
  if (typeof value === 'string') {
    if (value.length > maxLen) {
      matches.push(`${path} (${value.length} chars)`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringsExceedingProvisionalMaxLength(item, `${path}[${index}]`, maxLen, matches);
    });
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    collectStringsExceedingProvisionalMaxLength(child, childPath, maxLen, matches);
  }
}

function rejectInitialOpatDrugId(drugId, contextLabel, fail) {
  if (drugId && INITIAL_OPAT_DRUG_IDS.includes(drugId)) {
    fail(
      `${contextLabel}: drug_id "${drugId}" matches an initial OPAT drug id; fixture validation rejects real drug ids until real-data readiness policy exists.`,
    );
  }
}

/**
 * @param {object} pointerFile parsed YAML/JSON (fictional fixtures)
 * @param {string} fileLabel
 * @param {(message: string) => void} fail
 * @param {{ maxStringLength?: number, validateSchema?: (data: object) => boolean, validateSchemaErrors?: () => import('ajv').ErrorObject[] | null | undefined }} [options]
 */
export function validateSectionPointerFile(pointerFile, fileLabel, fail, options = {}) {
  const maxStringLength = options.maxStringLength ?? DEFAULT_PROVISIONAL_MAX_STRING_LENGTH;
  const validateSchema = options.validateSchema;

  if (validateSchema) {
    const valid = validateSchema(pointerFile);
    if (!valid) {
      const errors = options.validateSchemaErrors?.() ?? [];
      for (const err of errors) {
        const path = err.instancePath || '/';
        fail(`${fileLabel}: schema${path}: ${err.message}`);
      }
    }
  }

  const forbiddenMatches = [];
  collectForbiddenFields(
    pointerFile,
    '',
    SECTION_POINTER_FORBIDDEN_FIELDS,
    forbiddenMatches,
  );

  if (forbiddenMatches.length > 0) {
    fail(
      `${fileLabel}: section pointer file must not contain label body fields: ${forbiddenMatches.join(', ')}.`,
    );
  }

  rejectInitialOpatDrugId(pointerFile?.drug_id, fileLabel, fail);

  const longStrings = [];
  collectStringsExceedingProvisionalMaxLength(pointerFile, '', maxStringLength, longStrings);

  if (longStrings.length > 0) {
    fail(
      `${fileLabel}: string value(s) exceed provisional max length ${maxStringLength} (heuristic guard against accidental large pastes only; not paraphrase/copyright safety): ${longStrings.join(', ')}.`,
    );
  }

  const pointers = pointerFile?.pointers;
  if (!Array.isArray(pointers)) {
    if (!validateSchema) {
      fail(`${fileLabel}: pointers array is required.`);
    }
    return;
  }

  for (const [index, pointer] of pointers.entries()) {
    const ref = `${fileLabel} pointers[${index}]`;

    rejectInitialOpatDrugId(pointer?.drug_id, ref, fail);

    if (pointer.contains_text !== false) {
      fail(`${ref}: contains_text must be false for pointer-only records.`);
    }

    if (pointer.reuse_status !== 'unknown_requires_review') {
      fail(`${ref}: reuse_status must be unknown_requires_review.`);
    }

    if (pointer.review_required !== true) {
      fail(`${ref}: review_required must be true.`);
    }

    if (pointer.canonical_status === 'canonical') {
      fail(
        `${ref}: canonical_status must not be canonical without an approved OpenRxCore policy.`,
      );
    }

    if (pointer.canonical_status !== 'non_canonical') {
      fail(`${ref}: canonical_status must be non_canonical.`);
    }
  }
}
