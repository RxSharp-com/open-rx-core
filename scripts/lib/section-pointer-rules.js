/**
 * Proposed validation for DailyMed section pointer files (design phase).
 *
 * FIXTURE/DEMO SCOPE ONLY — invoked by validate-dailymed-section-pointer-failure-demo.js.
 * Not imported by scripts/validate.js. Not the production section-pointer schema.
 */

export const SECTION_POINTER_FORBIDDEN_FIELDS = [
  'body_text',
  'label_text',
  'full_text',
  'label_xml',
  'label_html',
  'html',
  'xml',
  'dosing_text',
  'warnings_text',
  'adverse_reactions_text',
  'counseling_text',
];

/** Provisional heuristic cap — not paraphrase/copyright safety. */
const DEFAULT_PROVISIONAL_MAX_STRING_LENGTH = 320;

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

/**
 * @param {object} pointerFile parsed YAML/JSON (fictional fixtures)
 * @param {string} fileLabel
 * @param {(message: string) => void} fail
 * @param {{ maxStringLength?: number }} [options]
 */
export function validateSectionPointerFile(pointerFile, fileLabel, fail, options = {}) {
  const maxStringLength = options.maxStringLength ?? DEFAULT_PROVISIONAL_MAX_STRING_LENGTH;

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

  const longStrings = [];
  collectStringsExceedingProvisionalMaxLength(pointerFile, '', maxStringLength, longStrings);

  if (longStrings.length > 0) {
    fail(
      `${fileLabel}: string value(s) exceed provisional max length ${maxStringLength} (heuristic guard against accidental large pastes only; not paraphrase/copyright safety): ${longStrings.join(', ')}.`,
    );
  }

  const pointers = pointerFile?.pointers;
  if (!Array.isArray(pointers)) {
    fail(`${fileLabel}: pointers array is required.`);
    return;
  }

  for (const [index, pointer] of pointers.entries()) {
    const ref = `${fileLabel} pointers[${index}]`;

    if (pointer.contains_text !== false) {
      fail(`${ref}: contains_text must be false for pointer-only records.`);
    }

    if (pointer.canonical_status === 'canonical') {
      fail(
        `${ref}: canonical_status must not be canonical without an approved OpenRxCore policy.`,
      );
    }
  }
}
