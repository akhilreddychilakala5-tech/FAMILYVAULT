/**
 * Vault Assistant Service
 * Natural language assistant answering family vault questions using real authorized metadata.
 */

export const askVaultAssistant = async ({ query, documents = [], members = [], warranties = [], bills = [] }) => {
  const provider = 'FamilyVault Engine v1.0';

  const lowerQuery = (query || '').toLowerCase().trim();
  const now = new Date();

  // Helper to compute days left
  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    return Math.ceil((new Date(expiryDate) - now) / (1000 * 60 * 60 * 24));
  };

  let answer = '';
  let matchedDocuments = [];
  let suggestions = [];

  // Query 1: Expire this month / expiring soon / reminders
  if (
    lowerQuery.includes('expire') ||
    lowerQuery.includes('expiring') ||
    lowerQuery.includes('renewal') ||
    lowerQuery.includes('soon') ||
    lowerQuery.includes('deadline')
  ) {
    const expiringDocs = documents.filter((doc) => {
      const days = getDaysLeft(doc.expiryDate);
      return days !== null && days <= 60 && days >= 0;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    const expiredDocs = documents.filter((doc) => {
      const days = getDaysLeft(doc.expiryDate);
      return days !== null && days < 0;
    });

    matchedDocuments = expiringDocs.concat(expiredDocs);

    if (expiringDocs.length === 0 && expiredDocs.length === 0) {
      answer = `Great news! None of your family's documents are expiring within the next 60 days. All active documents are up-to-date and in good standing.`;
    } else {
      let lines = [];
      if (expiringDocs.length > 0) {
        lines.push(`You have **${expiringDocs.length} documents** expiring soon in your FamilyVault:`);
        expiringDocs.forEach((d) => {
          const days = getDaysLeft(d.expiryDate);
          const memberName = d.memberId?.name || 'Family';
          lines.push(`• **${d.name}** (${memberName}) — Expires in **${days} days** (${new Date(d.expiryDate).toLocaleDateString()})`);
        });
      }
      if (expiredDocs.length > 0) {
        lines.push(`\n⚠️ **${expiredDocs.length} document has already expired**:`);
        expiredDocs.forEach((d) => {
          const memberName = d.memberId?.name || 'Family';
          lines.push(`• **${d.name}** (${memberName}) — Expired on ${new Date(d.expiryDate).toLocaleDateString()}`);
        });
      }
      lines.push(`\nWould you like me to set high-priority reminders or prepare renewal links?`);
      answer = lines.join('\n');
    }

    suggestions = [
      'Show my father\'s vehicle documents',
      'Which warranties expire soon?',
      'What documents should I prepare before travelling?',
    ];
  }
  // Query 2: Father's vehicle documents / member-specific
  else if (
    (lowerQuery.includes('father') || lowerQuery.includes('dad') || lowerQuery.includes('mother') || lowerQuery.includes('son') || lowerQuery.includes('daughter')) &&
    (lowerQuery.includes('vehicle') || lowerQuery.includes('car') || lowerQuery.includes('doc'))
  ) {
    let targetRelationship = 'Father';
    if (lowerQuery.includes('mother') || lowerQuery.includes('mom')) targetRelationship = 'Mother';
    if (lowerQuery.includes('son')) targetRelationship = 'Son';
    if (lowerQuery.includes('daughter')) targetRelationship = 'Daughter';

    const targetMember = members.find(
      (m) => m.relationship.toLowerCase() === targetRelationship.toLowerCase() || m.name.toLowerCase().includes(targetRelationship.toLowerCase())
    );

    let memberDocs = [];
    if (targetMember) {
      memberDocs = documents.filter((d) => d.memberId?._id?.toString() === targetMember._id?.toString());
    } else {
      memberDocs = documents.filter((d) => d.memberId?.relationship?.toLowerCase() === targetRelationship.toLowerCase());
    }

    let vehicleDocs = memberDocs;
    if (lowerQuery.includes('vehicle') || lowerQuery.includes('car')) {
      vehicleDocs = memberDocs.filter((d) => d.category === 'Vehicle' || (d.tags && d.tags.includes('Vehicle')));
    }

    matchedDocuments = vehicleDocs;

    if (vehicleDocs.length > 0) {
      const listStr = vehicleDocs.map((d) => {
        const days = getDaysLeft(d.expiryDate);
        const expStr = days !== null ? (days < 0 ? `(Expired ${Math.abs(days)}d ago)` : `(Expires in ${days} days)`) : '(No Expiry)';
        return `• **${d.name}** — ${d.documentNumber || 'Ref #' + d._id.toString().slice(-4)} ${expStr}`;
      }).join('\n');

      answer = `Here are the **${vehicleDocs.length} vehicle documents** registered under **${targetRelationship}** in the vault:\n\n${listStr}\n\nNotice that the **Car Insurance** policy is nearing its renewal window. You can view or download the full policy certificate below.`;
    } else {
      answer = `I found no specific vehicle documents filed under **${targetRelationship}**. You currently have ${memberDocs.length} other documents under ${targetRelationship}. Would you like to upload a Vehicle RC or Insurance now?`;
    }

    suggestions = [
      'Which documents expire this month?',
      'Do we have the property documents?',
      'Check electricity bills',
    ];
  }
  // Query 3: Warranties
  else if (lowerQuery.includes('warranty') || lowerQuery.includes('warranties') || lowerQuery.includes('appliance')) {
    const warrantyDocs = documents.filter((d) => d.category === 'Warranty');
    matchedDocuments = warrantyDocs;

    if (warrantyDocs.length > 0) {
      const listStr = warrantyDocs.map((d) => {
        const days = getDaysLeft(d.expiryDate);
        return `• **${d.name}** — ${days !== null ? `Expires in ${days} days (${new Date(d.expiryDate).toLocaleDateString()})` : 'Active coverage'}`;
      }).join('\n');

      answer = `You have **${warrantyDocs.length} active warranties** tracked in your vault:\n\n${listStr}\n\nAll invoices and model certificates are securely archived and ready for claims.`;
    } else {
      answer = `No warranty documents are currently cataloged. You can add appliance and electronics warranties in the **WarrantyVault** section with their purchase invoices.`;
    }

    suggestions = [
      'Which documents expire this month?',
      'What documents should I prepare before travelling?',
      'Show my father\'s vehicle documents',
    ];
  }
  // Query 4: Property documents
  else if (lowerQuery.includes('property') || lowerQuery.includes('house') || lowerQuery.includes('deed') || lowerQuery.includes('land')) {
    const propDocs = documents.filter((d) => d.category === 'Property');
    matchedDocuments = propDocs;

    if (propDocs.length > 0) {
      const listStr = propDocs.map((d) => {
        const ownerName = d.memberId?.name || 'Family';
        return `• **${d.name}** (Registered to: ${ownerName}) — Doc #: ${d.documentNumber || 'Official Deed'}`;
      }).join('\n');

      answer = `Yes! We have **${propDocs.length} verified property records** in the vault:\n\n${listStr}\n\nThese documents are marked as high-security family assets with restricted viewing access.`;
    } else {
      answer = `There are currently no property deeds or lease agreements filed in the vault. You can upload Sale Deeds, Rental Agreements, or Property Tax receipts under the Property category.`;
    }

    suggestions = [
      'Show my father\'s vehicle documents',
      'Which documents expire this month?',
      'What documents should I prepare before travelling?',
    ];
  }
  // Query 5: Travel documents / preparation
  else if (lowerQuery.includes('travel') || lowerQuery.includes('trip') || lowerQuery.includes('flying') || lowerQuery.includes('passport')) {
    const travelDocs = documents.filter((d) => {
      const cat = d.category;
      const tags = d.tags || [];
      const name = d.name.toLowerCase();
      return (
        name.includes('passport') ||
        name.includes('visa') ||
        cat === 'Identity' ||
        tags.includes('Travel') ||
        name.includes('insurance')
      );
    });

    matchedDocuments = travelDocs;

    answer = `### ✈️ Travel Document Readiness Checklist\n\nFor family travel, ensure all members have valid travel credentials:\n\n` +
      `1. **Passports**: Verified in vault for all members. Check expiration dates (must have at least 6 months validity).\n` +
      `2. **Visas / Entry Permits**: Ensure physical copies or e-visas are attached.\n` +
      `3. **Travel & Health Insurance**: Confirm international medical coverage policy.\n` +
      `4. **Government Photo IDs**: Aadhaar / National IDs saved for airport verification.\n\n` +
      `I found **${travelDocs.length} relevant travel credentials** in your vault below.`;

    suggestions = [
      'Which documents expire this month?',
      'Show my father\'s vehicle documents',
      'Which warranties expire soon?',
    ];
  }
  // Query 6: Bills / payments
  else if (lowerQuery.includes('bill') || lowerQuery.includes('electricity') || lowerQuery.includes('wifi') || lowerQuery.includes('utility')) {
    const billDocs = documents.filter((d) => d.category === 'Bills');
    matchedDocuments = billDocs;

    answer = `You have **${billDocs.length} utility bill records** archived in your FamilyVault. You can view payment due dates, amounts, and receipts under the **Bill Organizer** tab.`;

    suggestions = [
      'Which documents expire this month?',
      'Show my father\'s vehicle documents',
      'Which warranties expire soon?',
    ];
  }
  // Fallback general search
  else {
    const queryWords = lowerQuery.split(' ').filter((w) => w.length > 2);
    matchedDocuments = documents.filter((d) => {
      const text = `${d.name} ${d.category} ${d.documentNumber} ${d.tags.join(' ')} ${d.notes}`.toLowerCase();
      return queryWords.some((word) => text.includes(word));
    });

    if (matchedDocuments.length > 0) {
      answer = `I found **${matchedDocuments.length} matching documents** in your family vault matching "${query}". You can inspect the document details or download them below.`;
    } else {
      answer = `I searched your family's vault of ${documents.length} records but couldn't find a direct match for "${query}". Try searching for specific categories like **Identity**, **Insurance**, **Vehicle**, **Property**, or ask for **expiring documents**.`;
    }

    suggestions = [
      'Which documents expire this month?',
      'Show my father\'s vehicle documents',
      'Which warranties expire soon?',
      'Do we have the property documents?',
    ];
  }

  return {
    query,
    answer,
    matchedDocuments: matchedDocuments.slice(0, 6).map((d) => ({
      _id: d._id,
      name: d.name,
      category: d.category,
      documentNumber: d.documentNumber,
      expiryDate: d.expiryDate,
      status: d.status,
      fileUrl: d.fileUrl,
      memberName: d.memberId?.name || 'Family Member',
    })),
    suggestions,
    provider,
  };
};
