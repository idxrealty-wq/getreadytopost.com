// src/lib/grading/lengthScoring.ts

export interface LengthMetrics {
  wordCount: number;
  wordCountScore: number;
  avgSentenceLength: number;
  sentenceStructureScore: number;
  activeVoicePercentage: number;
  activeVoiceScore: number;
  paragraphCount: number;
  paragraphStructureScore: number;
}

export interface LengthResult {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  metrics: LengthMetrics;
  auditTrail: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function countSentences(text: string): number {
  const sentences = text.match(/[.!?]+/g) || [];
  return Math.max(sentences.length, 1);
}

function avgSentenceLength(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  return words / sentences;
}

function estimateActiveVoice(text: string): number {
  // Simple heuristic: count passive voice markers
  const passiveMarkers = (text.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
  const totalWords = countWords(text);
  const passivePercentage = (passiveMarkers / totalWords) * 100;
  return Math.max(0, 100 - passivePercentage);
}

function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0).length;
}

export function scoreLength(text: string): LengthResult {
  const wordCount = countWords(text);
  const avgSentLen = avgSentenceLength(text);
  const activeVoicePerc = estimateActiveVoice(text);
  const paragraphCount = countParagraphs(text);

  // Word count (40 points)
  let wordCountScore = 0;
  if (wordCount >= 145 && wordCount <= 165) wordCountScore = 40;
  else if (wordCount >= 140 && wordCount <= 170) wordCountScore = 35;
  else if (wordCount >= 130 && wordCount <= 180) wordCountScore = 25;
  else if (wordCount < 130 || wordCount > 180) wordCountScore = 10;
  else if (wordCount < 100 || wordCount > 200) wordCountScore = 0;

  // Sentence structure (30 points)
  let sentenceStructureScore = 0;
  if (avgSentLen >= 12 && avgSentLen <= 15) sentenceStructureScore = 30;
  else if (avgSentLen > 15 && avgSentLen <= 18) sentenceStructureScore = 25;
  else if (avgSentLen > 18 && avgSentLen <= 25) sentenceStructureScore = 15;
  else if (avgSentLen > 25) sentenceStructureScore = 5;

  // Active voice (20 points)
  let activeVoiceScore = 0;
  if (activeVoicePerc > 80) activeVoiceScore = 20;
  else if (activeVoicePerc >= 60 && activeVoicePerc <= 80) activeVoiceScore = 15;
  else if (activeVoicePerc >= 40 && activeVoicePerc < 60) activeVoiceScore = 10;
  else activeVoiceScore = 0;

  // Paragraph structure (10 points)
  let paragraphStructureScore = 0;
  if (paragraphCount >= 3 && paragraphCount <= 4) paragraphStructureScore = 10;
  else if (paragraphCount >= 2 && paragraphCount <= 3) paragraphStructureScore = 7;
  else if (paragraphCount === 1) paragraphStructureScore = 3;
  else if (paragraphCount >= 5) paragraphStructureScore = 5;

  const totalScore = wordCountScore + sentenceStructureScore + activeVoiceScore + paragraphStructureScore;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 75) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else if (totalScore >= 45) grade = 'D';

  const auditTrail = `${wordCount} words (${wordCountScore}/40), avg ${avgSentLen.toFixed(1)} words/sentence (${sentenceStructureScore}/30), ${activeVoicePerc.toFixed(0)}% active voice (${activeVoiceScore}/20), ${paragraphCount} paragraphs (${paragraphStructureScore}/10). Total: ${totalScore}/100`;

  return {
    grade,
    score: totalScore,
    metrics: {
      wordCount,
      wordCountScore,
      avgSentenceLength: parseFloat(avgSentLen.toFixed(1)),
      sentenceStructureScore,
      activeVoicePercentage: parseFloat(activeVoicePerc.toFixed(0)),
      activeVoiceScore,
      paragraphCount,
      paragraphStructureScore,
    },
    auditTrail,
  };
}
