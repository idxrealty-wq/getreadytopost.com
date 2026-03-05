import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase Admin init failed');
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function gradeToPoints(g: string): number {
  const x = String(g || '').toUpperCase().trim();
  if (x === 'A') return 4;
  if (x === 'B') return 3;
  if (x === 'C') return 2;
  if (x === 'D') return 1;
  return 0;
}

function pointsToGrade(avg: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (avg >= 3.6) return 'A';
  if (avg >= 2.6) return 'B';
  if (avg >= 1.6) return 'C';
  if (avg >= 0.6) return 'D';
  return 'F';
}

function buildFactsBlock(propertyDetails: any): string {
  const pd = propertyDetails || {};
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
  add('ZIP', pd.zip);
  add('Bedrooms', pd.beds);
  add('Bathrooms', pd.baths);
  add('Square Feet', pd.sqft);
  add('Year Built', pd.yearBuilt);
  add('Price', pd.price);
  add('HOA', pd.hoa);
  add('HOA Amount', pd.hoaAmount);
  return lines.length ? lines.join('\n') : 'None provided.';
}

async function callOpenAI(key: string, system: string, user: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || '').trim();
}

function parseGradingResponse(text: string): { categories: any; recommendations: string[] } {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const categories: any = {
    headline: { grade: 'F', feedback: '' },
    length: { grade: 'F', feedback: '' },
    emotion: { grade: 'F', feedback: '' },
    keywords: { grade: 'F', feedback: '' },
    cta: { grade: 'F', feedback: '' },
    compliance: { grade: 'F', feedback: '' },
  };
  const recommendations: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('recommendation:') || trimmed.startsWith('recommendation |')) {
      const rec = trimmed.replace(/^recommendation[:|]\s*/i, '').trim();
      if (rec) recommendations.push(rec);
    } else {
      const parts = trimmed.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        const key = parts[0].toLowerCase();
        const grade = parts[1].toUpperCase().charAt(0);
        const feedback = parts.slice(2).join(' ').trim() || 'No feedback';
        if (categories[key]) {
          categories[key].grade = ['A', 'B', 'C', 'D', 'F'].includes(grade) ? grade : 'F';
          categories[key].feedback = feedback;
        }
      }
    }
  }

  return { categories, recommendations };
}

async function ensureRewriteLength(rewrite: string, key: string, factsBlock: string): Promise<string> {
  let current = rewrite;
  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 145 && wc <= 165) return current;
    try {
      current = await callOpenAI(
        key,
        'Rewrite to exactly 155 words (145-165 allowed). Return ONLY the text.',
        `FACTS:\n${factsBlock}\n\nRewrite to 155 words:\n\n${current}`
      );
    } catch {
      return current;
    }
  }
  return current;
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const submissionRef = db.collection('submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const data = submissionDoc.data() || {};
    const listingText = String(data.listingText || '');
    const propertyDetails = data.propertyDetails || {};
    const factsBlock = buildFactsBlock(propertyDetails);

    await submissionRef.update({
      status: 'processing',
      debug: { stage: 'processing', updatedAt: new Date().toISOString(), projectId: process.env.FIREBASE_ADMIN_PROJECT_ID },
    });

    const openaiKey = String(process.env.OPENAI_API_KEY || '');
    if (!openaiKey) {
      await submissionRef.update({
        status: 'error',
        debug: { stage: 'error', errorStage: 'missing_openai_key', errorMessage: 'Missing OPENAI_API_KEY', updatedAt: new Date().toISOString() },
      });
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Grade original (plain text response)
    const originalSystem = `Grade the ORIGINAL listing across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY plain text, one category per line, format: category|grade|feedback. Example: headline|A|Strong opening. Then list recommendations starting with "recommendation|".`;
    const originalUser = `FACTS:\n${factsBlock}\n\nORIGINAL:\n${listingText}`;

    let originalText: string;
    try {
      originalText = await callOpenAI(openaiKey, originalSystem, originalUser);
    } catch (e: any) {
      await submissionRef.update({
        status: 'error',
        debug: { stage: 'error', errorStage: 'original_grading', errorMessage: e?.message, updatedAt: new Date().toISOString() },
      });
      return NextResponse.json({ error: `Original grading failed: ${e?.message}` }, { status: 500 });
    }

    const originalParsed = parseGradingResponse(originalText);
    const originalOverall = pointsToGrade(
      Object.values(originalParsed.categories).reduce((sum: number, cat: any) => sum + gradeToPoints(cat.grade), 0) / 6
    );

    await submissionRef.update({
      debug: { stage: 'original_graded', updatedAt: new Date().toISOString() },
    });

    // Generate rewrite (plain text)
    const rewriteSystem = `You are an elite MLS listing rewriter. Use ONLY facts from FACTS block. Do NOT invent. WORD COUNT: 145-165 words. Return ONLY the rewritten text.`;
    const rewriteUser = `FACTS:\n${factsBlock}\n\nORIGINAL:\n${listingText}`;

    let rewriteText: string;
    try {
      rewriteText = await callOpenAI(openaiKey, rewriteSystem, rewriteUser);
    } catch (e: any) {
      await submissionRef.update({
        status: 'error',
        debug: { stage: 'error', errorStage: 'rewrite_generation', errorMessage: e?.message, updatedAt: new Date().toISOString() },
      });
      return NextResponse.json({ error: `Rewrite generation failed: ${e?.message}` }, { status: 500 });
    }

    rewriteText = await ensureRewriteLength(rewriteText, openaiKey, factsBlock);
    const rewriteWordCount = countWords(rewriteText);

    await submissionRef.update({
      debug: { stage: 'rewrite_generated', updatedAt: new Date().toISOString() },
    });

    // Grade rewrite (plain text response)
    const rewriteGradeSystem = `Grade the REWRITE across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY plain text, one category per line, format: category|grade|feedback. Example: headline|A|Strong opening.`;
    const rewriteGradeUser = `FACTS:\n${factsBlock}\n\nREWRITE:\n${rewriteText}`;

    let rewriteGradeText: string;
    try {
      rewriteGradeText = await callOpenAI(openaiKey, rewriteGradeSystem, rewriteGradeUser);
    } catch (e: any) {
      await submissionRef.update({
        status: 'error',
        debug: { stage: 'error', errorStage: 'rewrite_grading', errorMessage: e?.message, updatedAt: new Date().toISOString() },
      });
      return NextResponse.json({ error: `Rewrite grading failed: ${e?.message}` }, { status: 500 });
    }

    const rewriteParsed = parseGradingResponse(rewriteGradeText);
    const rewriteOverall = pointsToGrade(
      Object.values(rewriteParsed.categories).reduce((sum: number, cat: any) => sum + gradeToPoints(cat.grade), 0) / 6
    );

    const analysis = {
      original: {
        overall: originalOverall,
        categories: originalParsed.categories,
        recommendations: originalParsed.recommendations,
      },
      rewrite: {
        overall: rewriteOverall,
        categories: rewriteParsed.categories,
        text: rewriteText,
        wordCount: rewriteWordCount,
      },
    };

    await submissionRef.update({
      status: 'completed',
      analysis,
      completedAt: new Date().toISOString(),
      debug: { stage: 'completed', updatedAt: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    console.error('RUN_ANALYSIS_FATAL:', e?.message);
    return NextResponse.json({ error: `Fatal error: ${e?.message}` }, { status: 500 });
  }
}
