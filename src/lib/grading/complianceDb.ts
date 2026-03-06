// src/lib/grading/complianceDb.ts

export interface ComplianceViolation {
  type: 'FAIR_HOUSING_ACT' | 'MLS_VIOLATION';
  phrase: string;
  reason: string;
  suggestedReplacement: string;
}

export const PROHIBITED_PHRASES: ComplianceViolation[] = [
  // Fair Housing Act
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'great schools',
    reason: 'Implies family-friendly, discriminates by familial status',
    suggestedReplacement: 'Remove or mention specific school name with data',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'top schools',
    reason: 'Implies family-friendly, discriminates by familial status',
    suggestedReplacement: 'Remove or mention specific school name with data',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'school district',
    reason: 'Implies family-friendly, discriminates by familial status',
    suggestedReplacement: 'Remove or mention specific school name with data',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'master bedroom',
    reason: 'Replace with "Primary bedroom"',
    suggestedReplacement: 'Primary bedroom',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'master bath',
    reason: 'Replace with "Primary bath"',
    suggestedReplacement: 'Primary bath',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'quiet neighborhood',
    reason: 'Implies exclusivity, discriminates by disability',
    suggestedReplacement: 'Remove or describe specific amenities',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'peaceful area',
    reason: 'Implies exclusivity, discriminates by disability',
    suggestedReplacement: 'Remove or describe specific amenities',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'young professionals',
    reason: 'Age discrimination',
    suggestedReplacement: 'Remove or describe property features',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'retirees',
    reason: 'Age discrimination',
    suggestedReplacement: 'Remove or describe property features',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'active seniors',
    reason: 'Age discrimination',
    suggestedReplacement: 'Remove or describe property features',
  },
  {
    type: 'FAIR_HOUSING_ACT',
    phrase: 'wheelchair accessible',
    reason: 'Discriminates by disability (state as fact, not selling point)',
    suggestedReplacement: 'State factually if true, not as benefit',
  },
  // MLS Violations
  {
    type: 'MLS_VIOLATION',
    phrase: 'i love this home',
    reason: 'Agent opinion not allowed in MLS',
    suggestedReplacement: 'Remove agent opinion',
  },
  {
    type: 'MLS_VIOLATION',
    phrase: 'best home i\'ve seen',
    reason: 'Agent opinion not allowed in MLS',
    suggestedReplacement: 'Remove agent opinion',
  },
];

export const KEYWORD_DATABASE = {
  tier1: [
    'updated',
    'renovated',
    'new',
    'modern',
    'luxury',
    'hardwood floors',
    'granite counters',
    'stainless steel',
    'open concept',
    'chef\'s kitchen',
    'primary bedroom',
    'smart home',
    'energy-efficient',
  ],
  tier2: [
    'spacious',
    'bright',
    'charming',
    'elegant',
    'fireplace',
    'deck',
    'patio',
    'pool',
    'entertaining space',
    'gathering room',
    'walking distance',
    'walkable',
  ],
  tier3: [
    'imagine',
    'picture yourself',
    'wake up to',
    'sanctuary',
    'oasis',
    'escape',
    'retreat',
    'dream home',
    'perfect for',
    'ideal for',
    'vibrant',
    'community',
    'neighborhood',
  ],
};

export function checkCompliance(text: string): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  violations: Array<ComplianceViolation & { location: string }>;
  auditTrail: string;
} {
  const lowerText = text.toLowerCase();
  const violations: Array<ComplianceViolation & { location: string }> = [];

  for (const violation of PROHIBITED_PHRASES) {
    const regex = new RegExp(`\\b${violation.phrase}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      violations.push({
        ...violation,
        location: `Found ${matches.length} instance(s)`,
      });
    }
  }

  if (violations.length > 0) {
    return {
      grade: 'F',
      score: 0,
      violations,
      auditTrail: `${violations.length} critical violation(s) found. Overall grade capped at D.`,
    };
  }

  return {
    grade: 'A',
    score: 100,
    violations: [],
    auditTrail: 'No Fair Housing or MLS violations detected.',
  };
}
