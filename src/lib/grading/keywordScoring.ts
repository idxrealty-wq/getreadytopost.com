// src/lib/grading/keywordScoring.ts

import { KEYWORD_DATABASE } from './complianceDb';

export interface KeywordFound {
  keyword: string;
  tier: 1 | 2 | 3;
  location: string;
  points: number;
  bonus?: number;
}

export interface KeywordResult {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  keywordsFound: KeywordFound[];
  keywordCount: number;
  stuffingPenalties: number;
  auditTrail: string;
}

export function scoreKeywords(text: string): KeywordResult {
  const lowerText = text.toLowerCase();
  const keywordsFound: KeywordFound[] = [];
  let totalPoints = 0;
  let stuffingPenalties = 0;

  // Check Tier 1
  for (const keyword of KEYWORD_DATABASE.tier1) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        let points = 5;
        let bonus = 0;

        // Bonus for headline/first sentence
        const firstSentenceEnd = lowerText.indexOf('.');
        const keywordPos = lowerText.indexOf(keyword.toLowerCase());
        if (keywordPos < firstSentenceEnd) bonus += 2;
        if (keywordPos < 50) bonus += 3; // Early in text

        points += bonus;
        totalPoints += points;

        keywordsFound.push({
          keyword,
          tier: 1,
          location: `Instance ${i + 1}`,
          points,
          bonus: bonus > 0 ? bonus : undefined,
        });
      }
    }
  }

  // Check Tier 2
  for (const keyword of KEYWORD_DATABASE.tier2) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        const points = 3;
        totalPoints += points;
        keywordsFound.push({
          keyword,
          tier: 2,
          location: `Instance ${i + 1}`,
          points,
        });
      }
    }
  }

  // Check Tier 3
  for (const keyword of KEYWORD_DATABASE.tier3) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        const points = 2;
        totalPoints += points;
        keywordsFound.push({
          keyword,
          tier: 3,
          location: `Instance ${i + 1}`,
          points,
        });
      }
    }
  }

  // Keyword stuffing penalty (more than 10 keywords = -5 per extra)
  if (keywordsFound.length > 10) {
    stuffingPenalties = (keywordsFound.length - 10) * 5;
  }

  const finalScore = Math.max(0, Math.min(50, totalPoints - stuffingPenalties));

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 45) grade = 'A';
  else if (finalScore >= 35) grade = 'B';
  else if (finalScore >= 25) grade = 'C';
  else if (finalScore >= 10) grade = 'D';

  const auditTrail = `${keywordsFound.length} keywords found. Points: ${totalPoints}. Stuffing penalties: -${stuffingPenalties}. Total: ${finalScore}/50`;

  return {
    grade,
    score: finalScore,
    keywordsFound,
    keywordCount: keywordsFound.length,
    stuffingPenalties,
    auditTrail,
  };
}
