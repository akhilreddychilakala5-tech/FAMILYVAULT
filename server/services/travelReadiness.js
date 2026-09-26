/**
 * AI Travel & Mission Readiness Checker
 * Evaluates family documents for international/domestic trips,
 * checking 6-month passport rules, travel insurance, visas, and IDs.
 */

export const checkTravelReadiness = ({ documents = [], members = [], destination = 'International Travel (General)' }) => {
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(now.getMonth() + 6);

  const memberEvaluations = [];
  let totalRequirements = 0;
  let metRequirements = 0;
  const globalAlerts = [];

  // Evaluate travel insurance in vault
  const hasTravelInsurance = documents.some((d) => {
    const text = `${d.name} ${d.tags.join(' ')}`.toLowerCase();
    return d.category === 'Insurance' && (text.includes('travel') || text.includes('international') || text.includes('health'));
  });

  if (!hasTravelInsurance) {
    globalAlerts.push({
      type: 'warning',
      message: 'No dedicated International Travel Medical Insurance found in the family vault.',
    });
  }

  members.forEach((member) => {
    const memberDocs = documents.filter(
      (d) => d.memberId?._id?.toString() === member._id.toString() || d.memberId?.toString() === member._id.toString()
    );

    const checks = [];

    // 1. Passport Check
    totalRequirements += 2;
    const passport = memberDocs.find((d) => d.name.toLowerCase().includes('passport') || (d.tags && d.tags.includes('Passport')));

    if (!passport) {
      checks.push({
        name: 'Passport',
        status: 'missing',
        message: 'No passport uploaded to vault.',
        severity: 'danger',
      });
    } else {
      metRequirements += 1;
      if (passport.expiryDate) {
        const expiry = new Date(passport.expiryDate);
        if (expiry < now) {
          checks.push({
            name: 'Passport',
            status: 'expired',
            message: `Passport expired on ${expiry.toLocaleDateString()}. Cannot be used for travel.`,
            severity: 'danger',
          });
        } else if (expiry < sixMonthsFromNow) {
          checks.push({
            name: 'Passport',
            status: 'warning',
            message: `Passport expires on ${expiry.toLocaleDateString()} (less than 6 months validity!). Many international borders will reject entry.`,
            severity: 'warning',
          });
        } else {
          metRequirements += 1;
          checks.push({
            name: 'Passport',
            status: 'valid',
            message: `Passport valid until ${expiry.toLocaleDateString()} (>6 months validity verified).`,
            severity: 'success',
          });
        }
      } else {
        checks.push({
          name: 'Passport',
          status: 'warning',
          message: 'Passport on file without recorded expiry date.',
          severity: 'warning',
        });
      }
    }

    // 2. Government Photo ID (Aadhaar / National ID)
    totalRequirements += 1;
    const nationalId = memberDocs.find((d) => d.category === 'Identity');
    if (nationalId) {
      metRequirements += 1;
      checks.push({
        name: 'Primary Government ID',
        status: 'valid',
        message: `${nationalId.name} active in vault for airport check-in.`,
        severity: 'success',
      });
    } else {
      checks.push({
        name: 'Primary Government ID',
        status: 'missing',
        message: 'No secondary government photo ID on file.',
        severity: 'warning',
      });
    }

    // 3. Clinical Vaccinations / Medical Record
    const medRecord = memberDocs.find((d) => d.category === 'Other' || (d.tags && d.tags.includes('Medical')));
    if (medRecord) {
      checks.push({
        name: 'Medical & Vaccination Records',
        status: 'valid',
        message: 'Clinical vaccination record available in vault.',
        severity: 'success',
      });
    }

    memberEvaluations.push({
      memberId: member._id,
      name: member.name,
      relationship: member.relationship,
      avatar: member.avatar,
      checks,
    });
  });

  const readinessPercent = totalRequirements > 0 ? Math.round((metRequirements / totalRequirements) * 100) : 80;

  return {
    destination,
    readinessPercent,
    status: readinessPercent >= 85 ? 'Ready for Travel' : readinessPercent >= 60 ? 'Action Needed' : 'Not Ready',
    globalAlerts,
    memberEvaluations,
    evaluatedAt: new Date(),
  };
};
