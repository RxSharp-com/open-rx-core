/**
 * Business-rule validation for evidence.yaml (schema v1.0).
 */

const HIGH_REVIEW_LEVELS = new Set([
  'level_3_recommendation_impacting',
  'level_4_specialty_high_risk',
]);

const REUSABLE_CONTENT_FIELDS = [
  'clinical_claim',
  'patient_facing_candidate',
  'clinician_facing_candidate',
];

export function citationIdPattern(drugId) {
  const escaped = drugId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}-cite-\\d{4}$`);
}

export function packetIdPattern(drugId) {
  const escaped = drugId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}-packet-\\d{4}$`);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasReusableContent(packet) {
  return REUSABLE_CONTENT_FIELDS.some((field) => isNonEmptyString(packet[field]));
}

function isRestrictedReuseStatus(reuseStatus) {
  return reuseStatus === 'restricted_no_reuse' || reuseStatus === 'citation_only';
}

/**
 * @param {object} evidence
 * @param {string} drugId
 * @param {(message: string) => void} fail
 * @param {{ requireNotImported?: boolean, requireNoClinicalClaims?: boolean }} [options]
 */
export function validateEvidenceRules(evidence, drugId, fail, options = {}) {
  const prefix = `[${drugId}] evidence.yaml`;

  if (evidence.schema_version !== '1.0') {
    fail(`${prefix}: schema_version must equal "1.0".`);
  }

  if (evidence.drug_id !== drugId) {
    fail(`${prefix}: drug_id must match folder name "${drugId}".`);
  }

  if (options.requireNotImported && evidence.evidence_status !== 'not_imported') {
    fail(`${prefix}: evidence_status must be not_imported for placeholder drug folders.`);
  }

  const sources = evidence.sources ?? [];
  const citations = evidence.citations ?? [];
  const packets = evidence.evidence_packets ?? [];

  const sourceById = new Map();
  for (const source of sources) {
    if (sourceById.has(source.source_id)) {
      fail(`${prefix}: duplicate source_id "${source.source_id}".`);
    }
    sourceById.set(source.source_id, source);

    if (source.source_type === 'human_synthesis') {
      const hasAuthorMetadata = isNonEmptyString(source.notes);
      const markedPending = source.source_status === 'pending_review';
      if (!hasAuthorMetadata && !markedPending) {
        fail(
          `${prefix}: human_synthesis source "${source.source_id}" must include author/reviewer metadata in notes or use source_status pending_review.`,
        );
      }
    }
  }

  const citationById = new Map();
  const citePattern = citationIdPattern(drugId);
  for (const citation of citations) {
    if (!citePattern.test(citation.citation_id)) {
      fail(`${prefix}: citation_id "${citation.citation_id}" must match ${drugId}-cite-#### format.`);
    }
    if (citationById.has(citation.citation_id)) {
      fail(`${prefix}: duplicate citation_id "${citation.citation_id}".`);
    }
    citationById.set(citation.citation_id, citation);

    if (!sourceById.has(citation.source_id)) {
      fail(`${prefix}: citation "${citation.citation_id}" references missing source_id "${citation.source_id}".`);
    }
  }

  const packetPattern = packetIdPattern(drugId);
  const seenPacketIds = new Set();
  for (const packet of packets) {
    if (!packetPattern.test(packet.packet_id)) {
      fail(`${prefix}: packet_id "${packet.packet_id}" must match ${drugId}-packet-#### format.`);
    }
    if (seenPacketIds.has(packet.packet_id)) {
      fail(`${prefix}: duplicate packet_id "${packet.packet_id}".`);
    }
    seenPacketIds.add(packet.packet_id);

    for (const citationId of packet.citation_ids ?? []) {
      if (!citationById.has(citationId)) {
        fail(`${prefix}: packet "${packet.packet_id}" references missing citation_id "${citationId}".`);
      }
    }

    for (const sourceId of packet.source_ids ?? []) {
      if (!sourceById.has(sourceId)) {
        fail(`${prefix}: packet "${packet.packet_id}" references missing source_id "${sourceId}".`);
      }
    }

    const clinicalClaim = packet.clinical_claim;
    if (isNonEmptyString(clinicalClaim)) {
      if (options.requireNoClinicalClaims) {
        fail(`${prefix}: placeholder drug evidence must not contain non-empty clinical_claim in packet "${packet.packet_id}".`);
      }

      if (!Array.isArray(packet.citation_ids) || packet.citation_ids.length < 1) {
        fail(`${prefix}: packet "${packet.packet_id}" has clinical_claim but no citation_ids.`);
      }

      if (packet.packet_status !== 'approved' && packet.requires_human_review !== true) {
        fail(
          `${prefix}: packet "${packet.packet_id}" has clinical_claim and requires_human_review must be true unless packet_status is approved.`,
        );
      }
    }

    if (packet.recommendation_impact === 'direct' && !HIGH_REVIEW_LEVELS.has(packet.review_level)) {
      fail(
        `${prefix}: packet "${packet.packet_id}" with recommendation_impact direct requires review_level level_3_recommendation_impacting or level_4_specialty_high_risk.`,
      );
    }

    if (packet.packet_status === 'approved') {
      for (const sourceId of packet.source_ids ?? []) {
        const source = sourceById.get(sourceId);
        if (source?.reuse_status === 'unknown_requires_review') {
          fail(
            `${prefix}: approved packet "${packet.packet_id}" cannot use source "${sourceId}" with reuse_status unknown_requires_review.`,
          );
        }
      }
    }

    if (hasReusableContent(packet)) {
      for (const sourceId of packet.source_ids ?? []) {
        const source = sourceById.get(sourceId);
        if (!source) {
          continue;
        }
        if (source.reuse_status === 'restricted_no_reuse') {
          fail(
            `${prefix}: packet "${packet.packet_id}" with reusable content cannot use source "${sourceId}" with reuse_status restricted_no_reuse.`,
          );
        }
        if (source.reuse_status === 'citation_only') {
          fail(
            `${prefix}: packet "${packet.packet_id}" with reusable derived content cannot use source "${sourceId}" with reuse_status citation_only.`,
          );
        }
      }
    }
  }

  if (options.requireNoClinicalClaims) {
    for (const packet of packets) {
      if (
        isNonEmptyString(packet.clinical_claim)
        || isNonEmptyString(packet.patient_facing_candidate)
        || isNonEmptyString(packet.clinician_facing_candidate)
      ) {
        fail(`${prefix}: placeholder drug evidence must not contain reusable clinical or monograph candidate text.`);
      }
    }
  }
}
