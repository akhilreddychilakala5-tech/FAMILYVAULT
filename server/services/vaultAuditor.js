/**
 * Vault Health Auditor Service
 * Evaluates the entire family vault for coverage gaps, expired risks,
 * unindexed members, and missing emergency protections.
 */

export const auditVaultHealth = ({ documents = [], members = [] }) => {
  const now = new Date();

  let score = 100;
  const criticalGaps = [];
  const warnings = [];
  const positiveNotes = [];

  // Check 1: Expired documents
  const expiredDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < now;
  });

  if (expiredDocs.length > 0) {
    score -= expiredDocs.length * 15;
    criticalGaps.push({
      id: 'expired-docs',
      type: 'critical',
      title: `${expiredDocs.length} Expired Document${expiredDocs.length > 1 ? 's' : ''}`,
      description: `Immediate renewal needed for: ${expiredDocs.map((d) => d.name).join(', ')}.`,
      impact: -15 * expiredDocs.length,
      action: 'Renew Now',
      category: 'Expiry Risk',
    });
  } else {
    positiveNotes.push('No actively expired documents in the vault.');
  }

  // Check 2: Documents expiring within 30 days
  const expiringSoonDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    const diff = Math.ceil((new Date(d.expiryDate) - now) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  if (expiringSoonDocs.length > 0) {
    score -= expiringSoonDocs.length * 5;
    warnings.push({
      id: 'expiring-soon',
      type: 'warning',
      title: `${expiringSoonDocs.length} Document${expiringSoonDocs.length > 1 ? 's' : ''} Expiring Within 30 Days`,
      description: `Expiring soon: ${expiringSoonDocs.map((d) => `${d.name} (${Math.ceil((new Date(d.expiryDate) - now) / 86400000)}d left)`).join(', ')}.`,
      impact: -5 * expiringSoonDocs.length,
      action: 'Review Renewal',
      category: 'Upcoming Deadlines',
    });
  }

  // Check 3: Family Member Coverage Gaps
  members.forEach((member) => {
    const memberDocs = documents.filter(
      (d) => d.memberId?._id?.toString() === member._id.toString() || d.memberId?.toString() === member._id.toString()
    );

    // Identity check
    const hasId = memberDocs.some((d) => d.category === 'Identity' || (d.tags && d.tags.includes('Identity')));
    if (!hasId) {
      score -= 10;
      criticalGaps.push({
        id: `missing-id-${member._id}`,
        type: 'critical',
        title: `Missing Primary ID for ${member.name}`,
        description: `${member.name} has no Government ID (Aadhaar/Passport/PAN) archived.`,
        impact: -10,
        action: 'Upload ID',
        category: 'Missing Vital Record',
      });
    }

    // Adult Health Insurance check
    if (['Father', 'Mother', 'Self', 'Spouse'].includes(member.relationship)) {
      const hasInsurance = documents.some((d) => d.category === 'Insurance');
      if (!hasInsurance) {
        score -= 15;
        criticalGaps.push({
          id: `missing-insurance-${member._id}`,
          type: 'critical',
          title: `No Health Insurance Linked to ${member.name}`,
          description: `No active medical or family floater policy registered for ${member.name}.`,
          impact: -15,
          action: 'Add Policy',
          category: 'Healthcare Risk',
        });
      }
    }
  });

  // Check 4: Emergency Access Vault Check
  const emergencyDocs = documents.filter((d) => d.isEmergency);
  if (emergencyDocs.length === 0) {
    score -= 10;
    warnings.push({
      id: 'no-emergency-docs',
      type: 'warning',
      title: 'Emergency Vault Empty',
      description: 'No vital documents have been marked for fast 1-tap emergency access.',
      impact: -10,
      action: 'Tag Emergency Docs',
      category: 'Crisis Readiness',
    });
  } else {
    positiveNotes.push(`${emergencyDocs.length} critical records pinned in Emergency Vault.`);
  }

  // Check 5: Property / Lease Records
  const hasProperty = documents.some((d) => d.category === 'Property');
  if (!hasProperty) {
    score -= 5;
    warnings.push({
      id: 'no-property',
      type: 'info',
      title: 'No Residential Property Documents',
      description: 'Consider archiving home sale deed, property tax receipt, or rental agreement.',
      impact: -5,
      action: 'Add Property',
      category: 'Real Estate',
    });
  } else {
    positiveNotes.push('Residential property deed and municipal tax records verified.');
  }

  // Bound score between 10 and 100
  const finalScore = Math.max(10, Math.min(100, score));

  let grade = 'Excellent';
  let badgeColor = 'emerald';
  if (finalScore < 60) {
    grade = 'Needs Attention';
    badgeColor = 'rose';
  } else if (finalScore < 85) {
    grade = 'Good Standing';
    badgeColor = 'amber';
  }

  return {
    score: finalScore,
    grade,
    badgeColor,
    criticalGaps,
    warnings,
    positiveNotes,
    auditedAt: new Date(),
    totalDocumentsEvaluated: documents.length,
    totalMembersEvaluated: members.length,
  };
};
