import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin init failed');
  }
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function gradeToPoints(g: string): number {
  const x = String(g || '').toUpperCase();
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

function computeOverallFromCategories(categories: any): 'A' | 'B' | 'C' | 'D' | 'F' {
  const keys = ['headline', 'length', 'emotion', 'keywords', 'cta', 'compliance'];
  const pts = keys.map((k) => gradeToPoints(categories?.[k]?.grade));
  const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
  return pointsToGrade(avg);
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

function extractJSON(text: string): any {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callOpenAIForJSON(key: string, system: string, user: string): Promise<any> {
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
  const content = String(data.choices?.[0]?.message?.content || '');
  const parsed = extractJSON(content);
  if (!parsed) throw new Error(`Failed to extract JSON from response`);
  return parsed;
}

async function callOpenAIForText(key: string, system: string, user: string): Promise<string> {
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

async function ensureRewriteLength(rewrite: string, key: string, factsBlock: string): Promise<string> {
  let current = rewrite;
  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 145 && wc <= 165) return current;
    try {
      current = await callOpenAIForText(
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

    await submissionRef.update({ status: 'processing' });

    const openaiKey = String(process.env.OPENAI_API_KEY || '');
    if (!openaiKey) {
      await submissionRef.update({ status: 'error', error: 'Missing OPENAI_API_KEY' });
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Grade original
    const originalSystem = `Grade the ORIGINAL listing across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY JSON: {"categories":{"headline":{"grade":"A|B|C|D|F","feedback":"one sentence"},"length":{"grade":"A|B|C|D|F","feedback":"one sentence"},"emotion":{"grade":"A|B|C|D|F","feedback":"one sentence"},"keywords":{"grade":"A|B|C|D|F","feedback":"one sentence"},"cta":{"grade":"A|B|C|D|F","feedback":"one sentence"},"compliance":{"grade":"A|B|C|D|F","feedback":"one sentence"}},"recommendations":["fix 1","fix 2","fix 3"]}`;
    const originalUser = `FACTS:\n${factsBlock}\n\nORIGINAL:\n${listingText}`;

    let original: any;
    try {
      original = await callOpenAIForJSON(openaiKey, originalSystem, originalUser);
    } catch (e: any) {
      await submissionRef.update({ status: 'error', error: `Original grading failed: ${e?.message}` });
      return NextResponse.json({ error: `Original grading failed: ${e?.message}` }, { status: 500 });
    }

    const originalOverall = computeOverallFromCategories(original.categories);

    // Generate rewrite (plain text)
    const rewriteSystem = `You are an elite MLS listing rewriter. Use ONLY facts from FACTS block. Do NOT invent. WORD COUNT: 145-165 words. Return ONLY the rewritten text.`;
    const rewriteUser = `FACTS:\n${factsBlock}\n\nORIGINAL:\n${listingText}`;

    let rewriteText: string;
    try {
      rewriteText = await callOpenAIForText(openaiKey, rewriteSystem, rewriteUser);
    } catch (e: any) {
      await submissionRef.update({ status: 'error', error: `Rewrite generation failed: ${e?.message}` });
      return NextResponse.json({ error: `Rewrite generation failed: ${e?.message}` }, { status: 500 });
    }

    rewriteText = await ensureRewriteLength(rewriteText, openaiKey, factsBlock);
    const rewriteWordCount = countWords(rewriteText);

    // Grade rewrite
    const rewriteGradeSystem = `Grade the REWRITE across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY JSON: {"categories":{"headline":{"grade":"A|B|C|D|F","feedback":"one sentence"},"length":{"grade":"A|B|C|D|F","feedback":"one sentence"},"emotion":{"grade":"A|B|C|D|F","feedback":"one sentence"},"keywords":{"grade":"A|B|C|D|F","feedback":"one sentence"},"cta":{"grade":"A|B|C|D|F","feedback":"one sentence"},"compliance":{"grade":"A|B|C|D|F","feedback":"one sentence"}}}`;
    const rewriteGradeUser = `FACTS:\n${factsBlock}\n\nREWRITE:\n${rewriteText}`;

    let rewriteGradeObj: any;
    try {
      rewriteGradeObj = await callOpenAIForJSON(openaiKey, rewriteGradeSystem, rewriteGradeUser);
    } catch (e: any) {
      await submissionRef.update({ status: 'error', error: `Rewrite grading failed: ${e?.message}` });
      return NextResponse.json({ error: `Rewrite grading failed: ${e?.message}` }, { status: 500 });
    }

    const rewriteOverall = computeOverallFromCategories(rewriteGradeObj.categories);

    const analysis = {
      original: {
        overall: originalOverall,
        categories: original.categories || {},
        recommendations: Array.isArray(original.recommendations) ? original.recommendations : [],
      },
      rewrite: {
        overall: rewriteOverall,
        categories: rewriteGradeObj.categories || {},
        text: rewriteText,
        wordCount: rewriteWordCount,
      },
    };

    await submissionRef.update({
      status: 'completed',
      analysis,
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    console.error('RUN_ANALYSIS_ERROR:', e?.message);
    return NextResponse.json({ error: `Analysis failed: ${e?.message}` }, { status: 500 });
  }
}
