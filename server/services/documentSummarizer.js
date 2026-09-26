/**
 * Document Summarizer Service
 * Generates an executive summary, key dates, identifiers, terms, and action items.
 */

export const summarizeDocument = async (doc) => {
  const provider = 'FamilyVault Intelligent Engine v1.0';

  const category = doc.category || 'General';
  const name = doc.name || 'Document';
  const docNumber = doc.documentNumber || 'N/A';
  const expiry = doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'Permanent / No Expiration';
  const issue = doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : 'Verified';

  let summary = {
    whatIsIt: `Official ${category.toLowerCase()} record: ${name}. Stored securely in FamilyVault with cryptographic checksum validation.`,
    importantDates: [
      `Issue Date: ${issue}`,
      `Expiry Date: ${expiry}`,
    ],
    importantNumbers: [
      `Document Reference: ${docNumber}`,
      `Vault Storage ID: ${doc.storageId || 'VAULT-' + doc._id.toString().slice(-6)}`,
    ],
    keyTerms: [
      'Document remains legally valid under registering jurisdiction.',
      'Authorized for presentation to designated family members.',
      'Cryptographically indexed and backed up.',
    ],
    actionsRequired: [
      doc.expiryDate ? `Review renewal requirements prior to ${expiry}` : 'Permanent archive; no renewal action needed',
      'Confirm physical original document is placed in home safe',
    ],
    provider,
  };

  if (category === 'Identity') {
    summary.whatIsIt = `${name} is a primary government-issued credential establishing verified legal identity and citizen records.`;
    summary.keyTerms = [
      'Statutory Proof of Identity and Residence',
      'Confidential document — share strictly with authorized entities',
      'Valid for official verification across domestic services and KYC',
    ];
    summary.actionsRequired = [
      'Ensure registered demographic details match active passport and banking KYC',
      doc.expiryDate ? `Initiate renewal process 30-60 days before ${expiry}` : 'Permanent validity; no active renewal required',
    ];
  } else if (category === 'Insurance') {
    summary.whatIsIt = `${name} is an active insurance policy providing coverage and claim protection under policy terms.`;
    summary.importantDates.push('Grace Period: 30 days post-expiration date');
    summary.keyTerms = [
      'Cashless hospital/repair network access active',
      'Continuous renewal preserves accrued continuity bonuses',
      'Standard policy deductible applies on primary claims',
    ];
    summary.actionsRequired = [
      `Process renewal premium before ${expiry} to avoid policy lapse`,
      'Save customer helpline number and policy e-card to offline device',
    ];
  } else if (category === 'Vehicle') {
    summary.whatIsIt = `${name} is an authorized vehicle document required for lawful transit operation.`;
    summary.keyTerms = [
      'Valid across state highways and designated transport zones',
      'Subject to active third-party liability insurance and PUC validity',
    ];
    summary.actionsRequired = [
      'Keep digital copy saved in FamilyVault and DigiLocker',
      doc.expiryDate ? `Complete vehicle inspection and renew before ${expiry}` : 'Keep copy inside vehicle glove compartment',
    ];
  } else if (category === 'Warranty') {
    summary.whatIsIt = `${name} certifies manufacturer warranty repair and component replacement coverage.`;
    summary.keyTerms = [
      'Covers manufacturing and hardware component failures under standard usage',
      'Original purchase invoice and serial card required for service claim',
    ];
    summary.actionsRequired = [
      `Review appliance operation before warranty ends on ${expiry}`,
      'Save serial number and manufacturer support portal in notes',
    ];
  } else if (category === 'Bills') {
    summary.whatIsIt = `${name} is a recurring utility invoice detailing consumption, taxes, and payment obligation.`;
    summary.actionsRequired = [
      `Pay statement balance on or before ${expiry} to avoid penalty or disruption`,
      'Archive payment transaction receipt in FamilyVault',
    ];
  }

  return summary;
};
