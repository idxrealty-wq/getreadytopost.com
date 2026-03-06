// src/lib/grading/structureScoring.ts

export interface StructureResult {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  openingHook: {
    score: number;
    text: string;
    reason: string;
  };
  callToAction: {
    score: number;
    text: string;
    reason: string;
  };
  auditTrail: string;
}

function findOpeningHook(text: string): { text: string; score: number; reason: string } {
  const firstSentence = text.split(/[.!?]/)[0].trim();

  const emotionalTriggers = ['imagine', 'picture yourself', 'wake up to', 'envision', 'discover'];
  const hasEmotionalTrigger = emotionalTriggers.some((t) => firstSentence.toLowerCase().includes(t));

  const propertyFeatures = ['updated', 'renovated', 'new', 'modern', 'luxury', 'spacious', 'bright'];
  const hasPropertyFeature = propertyFeatures.some((f) => firstSentence.toLowerCase().includes(f));

  const lifestyleBenefits = ['entertaining', 'gathering', 'family', 'relaxation', 'escape', 'retreat'];
  const hasLifestyleBenefit = lifestyleBenefits.some((b) => firstSentence.toLowerCase().includes(b));

  let score = 0;
  let reason = '';

  if (hasEmotionalTrigger && hasPropertyFeature && hasLifestyleBenefit) {
    score = 50;
    reason = 'Emotional trigger + property benefit + lifestyle appeal';
  } else if (hasPropertyFeature && hasLifestyleBenefit) {
    score = 40;
    reason = 'Property-specific feature + lifestyle benefit';
  } else if (hasPropertyFeature || hasLifestyleBenefit) {
    score = 30;
    reason = 'Clear opening with key feature or benefit';
  } else if (firstSentence.length > 10) {
    score = 15;
    reason = 'Generic opening';
  } else {
    score = 0;
    reason = 'No clear opening or hook';
  }

  return { text: firstSentence, score, reason };
}

function findCTA(text: string): { text: string; score: number; reason: string } {
  const ctaKeywords = ['schedule', 'contact', 'call', "don't miss", 'limited time', 'act now', 'reach out'];
  const lastSentence = text.split(/[.!?]/).pop()?.trim() || '';

  let score = 0;
  let reason = '';
  let foundCTA = '';

  for (const keyword of ctaKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      foundCTA = text.split(/[.!?]/).find((s) => s.toLowerCase().includes(keyword))?.trim() || '';
      if (keyword === 'schedule' || keyword === 'contact' || keyword === 'call') {
        score = 50;
        reason = `Explicit CTA: "${keyword}"`;
      } else if (keyword === "don't miss" || keyword === 'limited time') {
        score = 45;
        reason = `Urgent CTA: "${keyword}"`;
      } else {
        score = 35;
        reason = `Action-oriented language: "${keyword}"`;
      }
      break;
    }
  }

  if (score === 0) {
    if (lastSentence.length > 5) {
      score = 20;
      reason = 'Weak or buried CTA';
      foundCTA = lastSentence;
    } else {
      score = 0;
      reason = 'No CTA found';
      foundCTA = 'None';
    }
  }

  return { text: foundCTA, score, reason };
}

export function scoreStructure(text: string): StructureResult {
  const hook = findOpeningHook(text);
  const cta = findCTA(text);

  const totalScore = hook.score + cta.score;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 45) grade = 'D';

  const auditTrail = `Opening hook: ${hook.score}/50. CTA: ${cta.score}/50. Total: ${totalScore}/100`;

  return {
    grade,
    score: totalScore,
    openingHook: hook,
    callToAction: cta,
    auditTrail,
  };
}
