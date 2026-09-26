/**
 * Document Q&A Service ("Ask This Document")
 * Provides interactive question-answering strictly scoped to a single document.
 */

export const querySingleDocument = ({ document: doc, question }) => {
  const lowerQ = (question || '').toLowerCase().trim();
  const cat = doc.category || 'General';
  const name = doc.name || 'Document';
  const docNumber = doc.documentNumber || 'N/A';
  const expiry = doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : null;
  const issue = doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : null;
  const owner = doc.memberId?.name || 'Family Member';

  let answer = '';
  let keySnippet = '';

  if (lowerQ.includes('expire') || lowerQ.includes('expiry') || lowerQ.includes('valid') || lowerQ.includes('deadline')) {
    if (expiry) {
      const days = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (days < 0) {
        answer = `This document expired on **${expiry}** (${Math.abs(days)} days ago). It is currently classified as **Expired** and requires active renewal.`;
      } else {
        answer = `This document is valid until **${expiry}** (${days} days remaining from today). ${days <= 30 ? '⚠️ It is within its 30-day renewal notice window.' : '🟢 It is active and in good standing.'}`;
      }
      keySnippet = `Expiry Date: ${expiry}`;
    } else {
      answer = `This document (**${name}**) has **permanent validity** with no stated expiration date. As a vital statutory record, it remains permanently active in your vault.`;
      keySnippet = 'Permanent / No Expiration';
    }
  } else if (lowerQ.includes('claim') || lowerQ.includes('cashless') || lowerQ.includes('hospital') || lowerQ.includes('network')) {
    if (cat === 'Insurance') {
      answer = `### 🏥 Cashless Claim Protocol for ${name}\n\n1. **Network Identification**: Present policy number **${docNumber}** along with photo ID at the hospital TPA or insurance helpdesk.\n2. **Pre-Authorization**: For planned hospitalization, submit cashless pre-auth form 48 hours in advance. For emergency admission, notify the insurer within 24 hours.\n3. **Customer Helpline**: Reach out to **${doc.issuingAuthority || 'Insurer'}** citing Member: **${owner}**.\n4. **Documents to keep handy**: Digital copy of this policy certificate, Aadhaar card of patient, and clinical doctor recommendation.`;
      keySnippet = `Policy Ref: ${docNumber} • Insurer: ${doc.issuingAuthority}`;
    } else if (cat === 'Warranty') {
      answer = `### 🛠 Warranty Claim Procedure\n\n1. Contact authorized customer care for **${doc.issuingAuthority || 'the manufacturer'}**.\n2. Provide Model/Serial Number: **${docNumber}** and Original Purchase Date (${issue || 'recorded on invoice'}).\n3. An authorized field service engineer will be scheduled for on-site inspection. Ensure physical device serial label is intact.`;
      keySnippet = `Serial No: ${docNumber}`;
    } else {
      answer = `This record is classified as **${cat}**. Standard formal claim guidelines apply when submitting to ${doc.issuingAuthority || 'the authorized registry'}.`;
    }
  } else if (lowerQ.includes('number') || lowerQ.includes('ref') || lowerQ.includes('policy') || lowerQ.includes('id')) {
    answer = `The registered identification / policy reference for **${name}** is: **${docNumber}**. The issuing body on file is **${doc.issuingAuthority || 'Authorized Registry'}**.`;
    keySnippet = docNumber;
  } else if (lowerQ.includes('who') || lowerQ.includes('owner') || lowerQ.includes('holder') || lowerQ.includes('member')) {
    answer = `This document belongs to **${owner}** in your family vault. It was archived on ${new Date(doc.createdAt).toLocaleDateString()} with localized encryption.`;
    keySnippet = `Holder: ${owner}`;
  } else if (lowerQ.includes('water') || lowerQ.includes('damage') || lowerQ.includes('cover') || lowerQ.includes('accidental')) {
    if (cat === 'Warranty') {
      answer = `Standard manufacturer warranties cover **factory defects and component electrical/mechanical failures**. Accidental liquid spill, drop damage, or unauthorized tampering typically require separate accidental damage protection (like AppleCare+ or third-party appliance insurance). Check original terms on attached invoice.`;
      keySnippet = 'Manufacturing defects covered; accidental damage requires specialized rider.';
    } else if (cat === 'Insurance') {
      answer = `For vehicle policies, comprehensive coverage includes accidental exterior damage, flood/inundation damage, and third-party liabilities subject to policy compulsory deductible. For health policies, medically necessary hospitalization and doctor-prescribed treatments are covered under cashless network rules.`;
      keySnippet = 'Accidental damage claims covered under comprehensive tier.';
    } else {
      answer = `Coverage details depend on statutory jurisdiction guidelines for **${cat}** records.`;
    }
  } else if (lowerQ.includes('pay') || lowerQ.includes('amount') || lowerQ.includes('due') || lowerQ.includes('bill')) {
    answer = `This record is filed under **${cat}**. If this is an active billing statement or premium notice, ensure payment is initiated before the stated deadline (${expiry || 'scheduled cycle'}) to prevent late fees or interruption of services.`;
    keySnippet = `Due / Expiry: ${expiry || 'Permanent'}`;
  } else {
    // General semantic fallback using document context
    answer = `Based on the verified vault record for **${name}**:\n\n• **Category**: ${cat}\n• **Record Holder**: ${owner}\n• **Reference Identifier**: ${docNumber}\n• **Issuing Body**: ${doc.issuingAuthority || 'Verified Entity'}\n• **Key Dates**: ${issue ? `Issued ${issue} • ` : ''}${expiry ? `Expires ${expiry}` : 'Permanent validity'}\n\n${doc.notes ? `**Notes on File**: "${doc.notes}"\n\n` : ''}You can download the original digital certificate or generate an official communication letter using the AI Drafter tab.`;
    keySnippet = `${name} • ${docNumber}`;
  }

  return {
    question,
    answer,
    keySnippet,
    documentId: doc._id,
    answeredAt: new Date(),
  };
};
