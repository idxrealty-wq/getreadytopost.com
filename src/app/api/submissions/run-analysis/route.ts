import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { checkCompliance } from '@/lib/grading/complianceDb';
import { scoreLength } from '@/lib/grading/lengthScoring';
import { scoreKeywords } from '@/lib/grading/keywordScoring';
import { scoreStructure } from '@/lib/grading/structureScoring';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing');
  
  let sa: any;
  try {
    sa = JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e}`);
  }

  if (!sa.private_key) {
    throw new Error('Service account missing private_key');
  }

  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  initializeApp({ credential: cert(sa) });
}

function buildFactsBlock(pd: any): string {
  const lines: string[] = [];
  const add = (label: string, val: any) => {
    if (val === undefined || val === null) return;
    const s = String(val).trim();
    if (!s) return;
    lines.push(`${label}: ${s}`);
  };
  add('Address', pd.address);
  add('City', pd.city);
  add('State', pd.state);
  add('Bedrooms', pd.beds);
  add('Bathrooms', pd.baths);
  add('Square Feet', pd.sqft);
  add('Year Built', pd.yearBuilt);
  add('Price', pd.price);
  add('HOA', pd.hoa);
  return lines.length ? lines.join('\n') : 'None provided.';
}

async function callOpenAI(key: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || '').trim();
}

type AiRubricResult = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  evidence: string[];
  feedback: string;
};

function clampScore(x: any): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function normalizeGrade(g: any): 'A' | 'B' | 'C' | 'D' | 'F' {
  const x = String(g || '').toUpperCase().trim();
  if (x === 'A' || x === 'B' || x === 'C' || x === 'D' || x === 'F') return x;
  return 'F';
}

async function scoreWithAI(
  key: string,
  category: 'emotional_appeal' | 'clarity' | 'buyer_focus',
  listing: string,
  factsBlock: string
): Promise<AiRubricResult> {
  const rubrics: Record<string, string> = {
    emotional_appeal: `
A (90–100): Paints vivid picture, sensory language, creates desire
B (75–89): Mentions lifestyle benefits, some emotional language
C (60–74): Factual with minimal emotional appeal
D (45–59): Dry, no lifestyle language
F (0–44): Negative or off-putting tone
`,
    clarity: `
A (90–100): Crystal clear, easy to scan, strong message hierarchy
B (75–89): Clear with minor awkward phrasing
C (60–74): Understandable but dense or wordy
D (45–59): Confusing or unclear in places
F (0–44): Incomprehensible or misleading
`,
    buyer_focus: `
A (90–100): Addresses buyer pain points / desires with specific benefits
B (75–89): Mentions some buyer benefits
C (60–74): Generic buyer language
D (45–59): Minimal buyer focus
F (0–44): Buyer-hostile or off-putting
`,
  };

  const prompt = `
Grade this listing on ${category.toUpperCase()} using the rubric below.

Return ONLY valid JSON (no markdown, no extra text):
{
  "score": <0-100>,
  "grade": "<A|B|C|D|F>",
  "evidence": ["quote 1", "quote 2"],
  "feedback": "explanation tied to the rubric"
}

RUBRIC:
${rubrics[category]}

FACTS:
${factsBlock}

LISTING:
${listing}
`.trim();

  const response = await callOpenAI(key, 'You are an expert MLS listing grader. Return ONLY valid JSON.', prompt);

  try {
    const parsed = JSON.parse(response);
    return {
      score: clampScore(parsed.score),
      grade: normalizeGrade(parsed.grade),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map((x: any) => String(x)).slice(0, 4) : [],
      feedback: String(parsed.feedback || ''),
    };
  } catch (e) {
    console.error('AI scoring JSON parse error:', e, 'response was:', response);
    return { score: 60, grade: 'C', evidence: [], feedback: 'AI scoring returned invalid JSON.' };
  }
}

async function generateRewrite(key: string, listing: string, factsBlock: string): Promise<string> {
  const prompt = `
You are an elite MLS listing rewriter optimizing for conversion.

CONSTRAINTS:
- Use ONLY facts provided
- 145-165 words
- NO prohibited phrases (master bedroom → primary bedroom, great schools → remove)
- Open with emotional trigger + property benefit
- Close with a clear CTA (Schedule, Contact, Don't miss, etc.)
- Avoid ALL CAPS and excessive punctuation

PROPERTY FACTS:
${factsBlock}

ORIGINAL:
${listing}

Return ONLY the rewritten listing text. No explanation, no markdown.
`.trim();

  return await callOpenAI(key, 'You are an elite MLS listing rewriter. Return ONLY the rewritten listing text.', prompt);
}

function scoreToLetter(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function computeOverallScore(parts: {
  compliance: number;
  length: number;
  keywords: number;
  structure: number;
  emotionalAppeal: number;
  clarity: number;
  buyerFocus: number;
}): number {
  const keywords100 = Math.max(0, Math.min(100, (parts.keywords / 50) * 100));

  return (
    parts.compliance * 0.25 +
    parts.length * 0.15 +
    keywords100 * 0.1 +
    parts.structure * 0.1 +
    parts.emotionalAppeal * 0.15 +
    parts.clarity * 0.15 +
    parts.buyerFocus * 0.1
  );
}
export async function POST(req: NextRequest) {
  try {
    console.log('[run-analysis] Starting...');
    
    initAdmin();
    console.log('[run-analysis] Admin initialized');
    
    const db = getFirestore();
    const { submissionId } = await req.json();

    if (!submissionId) {
      console.error('[run-analysis] Missing submissionId');
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    console.log('[run-analysis] Fetching submission:', submissionId);
    const ref = db.collection('submissions').doc(submissionId);
    const snap = await ref.get();
    
    if (!snap.exists) {
      console.error('[run-analysis] Submission not found:', submissionId);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const data = snap.data() || {};
    const listingText = String(data.listingText || '');
    const factsBlock = buildFactsBlock(data.propertyDetails || {});
    const openaiKey = process.env.OPENAI_API_KEY || '';

    if (!openaiKey) {
      console.error('[run-analysis] Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    console.log('[run-analysis] Updating status to processing');
    await ref.update({ status: 'processing' });

    // ===== ORIGINAL LISTING: LAYER 1 (DETERMINISTIC) =====
    console.log('[run-analysis] Running deterministic scoring on original...');
    const complianceResult = checkCompliance(listingText);
    const lengthResult = scoreLength(listingText);
    const keywordsResult = scoreKeywords(listingText);
    const structureResult = scoreStructure(listingText);

    // ===== ORIGINAL LISTING: LAYER 2 (LLM RUBRIC-BOUND) =====
    console.log('[run-analysis] Running LLM scoring on original...');
    const emotionalAppeal = await scoreWithAI(openaiKey, 'emotional_appeal', listingText, factsBlock);
    const clarity = await scoreWithAI(openaiKey, 'clarity', listingText, factsBlock);
    const buyerFocus = await scoreWithAI(openaiKey, 'buyer_focus', listingText, factsBlock);

    // ===== ORIGINAL LISTING: CALCULATE OVERALL =====
    const originalScore = computeOverallScore({
      compliance: complianceResult.score,
      length: lengthResult.score,
      keywords: keywordsResult.score,
      structure: structureResult.score,
      emotionalAppeal: emotionalAppeal.score,
      clarity: clarity.score,
      buyerFocus: buyerFocus.score,
    });

    let originalGrade = scoreToLetter(originalScore);
    if (complianceResult.grade === 'F') {
      originalGrade = 'D';
    }

    console.log('[run-analysis] Original grade:', originalGrade, 'score:', originalScore);

    // ===== GENERATE REWRITE =====
    console.log('[run-analysis] Generating rewrite...');
    const rewriteText = await generateRewrite(openaiKey, listingText, factsBlock);
    console.log('[run-analysis] Rewrite generated, length:', rewriteText.length);

    // ===== REWRITE: LAYER 1 (DETERMINISTIC) =====
    console.log('[run-analysis] Running deterministic scoring on rewrite...');
    const rewriteComplianceResult = checkCompliance(rewriteText);
    const rewriteLengthResult = scoreLength(rewriteText);
    const rewriteKeywordsResult = scoreKeywords(rewriteText);
    const rewriteStructureResult = scoreStructure(rewriteText);

    // ===== REWRITE: LAYER 2 (LLM RUBRIC-BOUND) =====
    console.log('[run-analysis] Running LLM scoring on rewrite...');
    const rewriteEmotionalAppeal = await scoreWithAI(openaiKey, 'emotional_appeal', rewriteText, factsBlock);
    const rewriteClarity = await scoreWithAI(openaiKey, 'clarity', rewriteText, factsBlock);
    const rewriteBuyerFocus = await scoreWithAI(openaiKey, 'buyer_focus', rewriteText, factsBlock);

    // ===== REWRITE: CALCULATE OVERALL =====
    const rewriteScore = computeOverallScore({
      compliance: rewriteComplianceResult.score,
      length: rewriteLengthResult.score,
      keywords: rewriteKeywordsResult.score,
      structure: rewriteStructureResult.score,
      emotionalAppeal: rewriteEmotionalAppeal.score,
      clarity: rewriteClarity.score,
      buyerFocus: rewriteBuyerFocus.score,
    });

    let rewriteGrade = scoreToLetter(rewriteScore);
    if (rewriteComplianceResult.grade === 'F') {
      rewriteGrade = 'D';
    }

    console.log('[run-analysis] Rewrite grade:', rewriteGrade, 'score:', rewriteScore);
    // ===== SAVE TO FIRESTORE =====
    console.log('[run-analysis] Saving to Firestore...');
    
    const updatePayload = {
      status: 'completed',
      completedAt: new Date().toISOString(),
      rubricVersion: '2.0.0',
      scoringWeights: {
        compliance: 0.25,
        length: 0.15,
        keywords: 0.1,
        structure: 0.1,
        emotionalAppeal: 0.15,
        clarity: 0.15,
        buyerFocus: 0.1,
      },
      analysis: {
        original: {
          overall: {
            grade: originalGrade,
            score: Math.round(originalScore),
            complianceOverride: complianceResult.grade === 'F',
          },
          breakdown: {
            compliance: {
              grade: complianceResult.grade,
              score: complianceResult.score,
              violations: complianceResult.violations,
              auditTrail: complianceResult.auditTrail,
            },
            length: {
              grade: lengthResult.grade,
              score: lengthResult.score,
              metrics: lengthResult.metrics,
              auditTrail: lengthResult.auditTrail,
            },
            keywords: {
              grade: keywordsResult.grade,
              score: keywordsResult.score,
              keywordsFound: keywordsResult.keywordsFound,
              auditTrail: keywordsResult.auditTrail,
            },
            structure: {
              grade: structureResult.grade,
              score: structureResult.score,
              openingHook: structureResult.openingHook,
              callToAction: structureResult.callToAction,
              auditTrail: structureResult.auditTrail,
            },
            emotionalAppeal: {
              grade: emotionalAppeal.grade,
              score: emotionalAppeal.score,
              evidence: emotionalAppeal.evidence,
              feedback: emotionalAppeal.feedback,
            },
            clarity: {
              grade: clarity.grade,
              score: clarity.score,
              evidence: clarity.evidence,
              feedback: clarity.feedback,
            },
            buyerFocus: {
              grade: buyerFocus.grade,
              score: buyerFocus.score,
              evidence: buyerFocus.evidence,
              feedback: buyerFocus.feedback,
            },
          },
        },
        rewrite: {
          text: rewriteText,
          wordCount: rewriteText.trim().split(/\s+/).length,
          overall: {
            grade: rewriteGrade,
            score: Math.round(rewriteScore),
            complianceOverride: rewriteComplianceResult.grade === 'F',
          },
          breakdown: {
            compliance: {
              grade: rewriteComplianceResult.grade,
              score: rewriteComplianceResult.score,
              violations: rewriteComplianceResult.violations,
              auditTrail: rewriteComplianceResult.auditTrail,
            },
            length: {
              grade: rewriteLengthResult.grade,
              score: rewriteLengthResult.score,
              metrics: rewriteLengthResult.metrics,
              auditTrail: rewriteLengthResult.auditTrail,
            },
            keywords: {
              grade: rewriteKeywordsResult.grade,
              score: rewriteKeywordsResult.score,
              keywordsFound: rewriteKeywordsResult.keywordsFound,
              auditTrail: rewriteKeywordsResult.auditTrail,
            },
            structure: {
              grade: rewriteStructureResult.grade,
              score: rewriteStructureResult.score,
              openingHook: rewriteStructureResult.openingHook,
              callToAction: rewriteStructureResult.callToAction,
              auditTrail: rewriteStructureResult.auditTrail,
            },
            emotionalAppeal: {
              grade: rewriteEmotionalAppeal.grade,
              score: rewriteEmotionalAppeal.score,
              evidence: rewriteEmotionalAppeal.evidence,
              feedback: rewriteEmotionalAppeal.feedback,
            },
            clarity: {
              grade: rewriteClarity.grade,
              score: rewriteClarity.score,
              evidence: rewriteClarity.evidence,
              feedback: rewriteClarity.feedback,
            },
            buyerFocus: {
              grade: rewriteBuyerFocus.grade,
              score: rewriteBuyerFocus.score,
              evidence: rewriteBuyerFocus.evidence,
              feedback: rewriteBuyerFocus.feedback,
            },
          },
        },
      },
    };

    console.log('[run-analysis] Update payload size:', JSON.stringify(updatePayload).length, 'bytes');
    await ref.update(updatePayload);
    console.log('[run-analysis] Firestore update successful');

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    console.error('[run-analysis] FATAL ERROR:', e?.message);
    console.error('[run-analysis] Stack:', e?.stack);
    return NextResponse.json({ error: `Fatal: ${e?.message}` }, { status: 500 });
  }
}
