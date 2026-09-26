import { extractDocumentMetadata } from './documentExtractor.js';
import { summarizeDocument } from './documentSummarizer.js';
import { askVaultAssistant } from './vaultAssistant.js';
import { auditVaultHealth } from './vaultAuditor.js';
import { draftDocumentLetter } from './documentDrafter.js';
import { querySingleDocument } from './documentQA.js';
import { checkTravelReadiness } from './travelReadiness.js';

export const aiService = {
  extractMetadata: extractDocumentMetadata,
  summarize: summarizeDocument,
  askAssistant: askVaultAssistant,
  auditHealth: auditVaultHealth,
  draftLetter: draftDocumentLetter,
  askDocument: querySingleDocument,
  checkReadiness: checkTravelReadiness,
};

export default aiService;
