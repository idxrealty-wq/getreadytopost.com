import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing');
  const sa = JSON.parse(json);
  initializeApp({ credential: cert(sa) });
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
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return String(data.choices?.[0]?.message?.content || '').trim();
}

function parseGrading(text: string): { categories: any; recommendations: string[] } {
  const categories: any = {
    headline: { grade: 'F', feedback: '' },
    length: { grade: 'F', feedback: '' },
    emotion: { grade: 'F', feedback: '' },
    keywords: { grade: 'F', feedback: '' },
    cta: { grade: 'F', feedback: '' },
    compliance: { grade: 'F', feedback: '' },
  };
  const recommendations: string[] = [];
  for (const line of text.split('\n').filter((l) => l.trim())) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('recommendation')) {
      const rec = trimmed.replace(/^recommendation[:|]\s*/i, '').trim();
      if (rec) recommendations.push(rec);
    } else {
      const parts = trimmed.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        const key = parts[0].toLowerCase();
        const grade = parts[1].toUpperCase().charAt(0);
        const feedback = parts.slice(2).join(' ').trim() || 'No feedback';
        if (categories[key]) {
          categories[key].grade = ['A','B','C','D','F'].includes(grade) ? grade : 'F';
          categories[key].feedback = feedback;
        }
      }
    }
  }
  return { categories, recommendations };
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const { submissionId } = await req.json();

    if (!submissionId) return NextResponse.json({ error: 'submissionId required' }, { status: 400 });

    const ref = db.collection('submissions').doc(submissionId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const data = snap.data() || {};
    const listingText = String(data.listingText || '');
    const factsBlock = buildFactsBlock(data.propertyDetails || {});
    const openaiKey = process.env.OPENAI_API_KEY || '';
    if (!openaiKey) return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });

    await ref.update({ status: 'processing' });

    // Grade original
    const originalText = await callOpenAI(openaiKey,
      `Grade this MLS listing across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY plain text, one line per category: category|grade|feedback. Then list recommendations as: recommendation|text`,
      `FACTS:\n${factsBlock}\n\nLISTING:\n${listingText}`
    );
    const originalParsed = parseGrading(originalText);
    const originalOverall = pointsToGrade(Object.values(originalParsed.categories).reduce((s: number, c: any) => s + gradeToPoints(c.grade), 0) / 6);

    // Generate rewrite
    const rewriteText = await callOpenAI(openaiKey,
      `You are an elite MLS listing rewriter. Use ONLY facts provided. Write 145-165 words. Return ONLY the rewritten listing text.`,
      `FACTS:\n${factsBlock}\n\nORIGINAL:\n${listingText}`
    );

    // Grade rewrite
    const rewriteGradeText = await callOpenAI(openaiKey,
      `Grade this rewritten MLS listing across 6 categories: headline, length, emotion, keywords, cta, compliance. Return ONLY plain text, one line per category: category|grade|feedback.`,
      `FACTS:\n${factsBlock}\n\nREWRITE:\n${rewriteText}`
    );
    const rewriteParsed = parseGrading(rewriteGradeText);
    const rewriteOverall = pointsToGrade(Object.values(rewriteParsed.categories).reduce((s: number, c: any) => s + gradeToPoints(c.grade), 0) / 6);

    await ref.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      analysis: {
        original: { overall: originalOverall, categories: originalParsed.categories, recommendations: originalParsed.recommendations },
        rewrite: { overall: rewriteOverall, categories: rewriteParsed.categories, text: rewriteText, wordCount: countWords(rewriteText) },
      },
    });

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    return NextResponse.json({ error: `Fatal: ${e?.message}` }, { status: 500 });
  }
}
