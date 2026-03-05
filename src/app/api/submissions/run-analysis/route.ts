import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

function safeJsonParse(raw: string): any {
  try { return JSON.parse(raw); } catch { return null; }
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
  add('Property Type', pd.propertyType);
  add('Bedrooms', pd.beds);
  add('Bathrooms', pd.baths);
  add('Square Feet', pd.sqft);
  add('Lot Size', pd.lotSize);
  add('Year Built', pd.yearBuilt);
  add('Price', pd.price);
  add('HOA', pd.hoa);
  add('HOA Amount', pd.hoaAmount);
  add('Features', pd.features);
  return lines.length ? lines.join('\n') : 'None provided.';
}

async function ensureRewriteLength(rewrite: string, key: string, factsBlock: string): Promise<string> {
  let current = rewrite;
  for (let i = 0; i < 3; i++) {
    const wc = countWords(current);
    if (wc >= 145 && wc <= 165) return current;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an elite MLS listing copywriter. Use ONLY the provided facts. Do NOT invent any details. Rewrite to exactly 155 words (145-165 allowed). Home-first focus: 50% interior, 20% exterior, 20% lifestyle, 10% location max. MLS-safe, Fair Housing safe. Return ONLY the rewritten text.',
          },
          {
            role: 'user',
            content: `FACTS (only use these):\n${factsBlock}\n\nRewrite this to 155 words (145-165 allowed):\n\n${current}`,
          },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) return current;
    const data = await res.json();
    current = String(data.choices?.[0]?.message?.content || current).trim();
  }
  return current;
}

export async function POST(req: NextRequest) {
  initAdmin();
  const db = getFirestore();
  try {
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
    const email = String(data.email || '');
    const propertyDetails = data.propertyDetails || {};
    const factsBlock = buildFactsBlock(propertyDetails);

    await submissionRef.update({ status: 'processing' });

    const openaiKey = String(process.env.OPENAI_API_KEY || '');
    if (!openaiKey) {
      await submissionRef.update({ status: 'error', error: 'Missing OPENAI_API_KEY' });
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const systemPrompt = `You are an elite MLS listing rewriter and strict grader. You have TWO jobs:

JOB 1 - GRADE THE ORIGINAL: Grade the submitted listing strictly across 6 categories. Be honest. Most listings score B or C.

JOB 2 - REWRITE TO A: Produce a rewrite that earns an A on every category. Use ONLY facts from the FACTS block and original listing. Do NOT invent beds, baths, sqft, lot size, year built, HOA, views, waterfront, renovations, appliances, school zones, or distances. If a fact is missing, use confident neutral phrasing without inventing numbers.

WORD COUNT RULE: Rewrite must be 145-165 words. Count every word. Do not return fewer than 145 or more than 165.

CONTENT WEIGHT (strictly enforce this balance):
- 50% HOME INTERIOR: layout, beds, baths, kitchen, living areas, primary suite, flooring, ceilings, natural light, storage
- 20% HOME EXTERIOR: garage, yard, patio, pool, curb appeal, lot, outdoor entertaining
- 20% LIFESTYLE AND FEATURES: what it feels like to live there, standout features, HOA amenities if provided
- 10% LOCATION: one sentence max, nearest major landmark or city only, no invented distances

REWRITE STRUCTURE:
1) HOOK (1-2 sentences): Lead with the home strongest interior feature plus lifestyle benefit. Do NOT start with location.
2) INTERIOR TOUR (3-4 sentences): beds, baths, kitchen highlights, living space, primary suite, standout features
3) EXTERIOR AND EXTRAS (1-2 sentences): outdoor space, garage, pool, HOA if provided
4) LOCATION CLOSE (1 sentence max): brief location reference
5) CTA (1 sentence): strong call to action, schedule a showing, see it today

COMPLIANCE RULES:
- Use "primary bedroom" not "master"
- MLS-safe and Fair Housing compliant throughout
- No discriminatory language
- No invented facts

GRADING SCALE: A=all criteria met, B=mostly good with gaps, C=needs significant work, D=poor, F=unacceptable

Return ONLY valid JSON. No markdown. No commentary. No extra text.

OUTPUT JSON SHAPE:
{"overall":"A|B|C|D|F","originalGrade":"A|B|C|D|F","rewrite":"145-165 word A-grade rewrite here","categories":{"headline":{"grade":"A|B|C|D|F","feedback":"one sentence"},"length":{"grade":"A|B|C|D|F","feedback":"one sentence"},"emotion":{"grade":"A|B|C|D|F","feedback":"one sentence"},"keywords":{"grade":"A|B|C|D|F","feedback":"one sentence"},"cta":{"grade":"A|B|C|D|F","feedback":"one sentence"},"compliance":{"grade":"A|B|C|D|F","feedback":"one sentence"}},"recommendations":["specific fix 1","specific fix 2","specific fix 3"]}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `FACTS (only use these; do not add new facts):\n${factsBlock}\n\nORIGINAL LISTING TEXT:\n${listingText}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      await submissionRef.update({ status: 'error', error: err });
      return NextResponse.json({ error: 'OpenAI failed' }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const rawContent = String(openaiData.choices?.[0]?.message?.content || '{}');
    const unfenced = rawContent.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const firstBrace = unfenced.indexOf('{');
    const lastBrace = unfenced.lastIndexOf('}');
    const candidate = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace ? unfenced.slice(firstBrace, lastBrace + 1) : unfenced;
    const analysis = safeJsonParse(candidate);

    if (!analysis) {
      await submissionRef.update({ status: 'error', error: 'Failed to parse OpenAI JSON', rawContent });
      return NextResponse.json({ error: 'Bad OpenAI JSON' }, { status: 500 });
    }

    analysis.rewrite = await ensureRewriteLength(String(analysis.rewrite || ''), openaiKey, factsBlock);
    analysis.rewriteWordCount = countWords(String(analysis.rewrite || ''));

    // Overall MUST match the 6 category grades shown in the UI
    analysis.overall = computeOverallFromCategories(analysis.categories);

    // Preserve whatever the model said the original grade was
    analysis.originalGrade = analysis.originalGrade || 'C';

    await submissionRef.update({
      status: 'completed',
      analysis,
      completedAt: new Date().toISOString(),
      email,
      propertyDetails,
    });

    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const overall = String(analysis.overall || '');
        const originalGrade = String(analysis.originalGrade || '');
        const rewrite = String(analysis.rewrite || '');
        const recs: string[] = Array.isArray(analysis.recommendations) ? (analysis.recommendations as string[]) : [];
        const gradeColor = overall === 'A' ? '#27ae60' : overall === 'B' ? '#f39c12' : overall === 'C' ? '#e74c3c' : overall === 'D' ? '#c0392b' : '#95a5a6';
        const recsHtml = recs.map((rec: string) => `<li style="margin:12px 0;color:#2c3e50;line-height:1.6;">\${rec}</li>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;"><div style="max-width:600px;margin:0 auto;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);padding:40px 20px;text-align:center;color:white;"><h1 style="margin:0;font-size:28px;font-weight:700;">GetReadyToPost</h1><p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;">Real Estate Listing Analysis Report</p></div><div style="background-color:#ecf0f1;padding:30px 20px;text-align:center;"><p style="margin:0 0 8px 0;color:#7f8c8d;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Rewrite Grade</p><div style="display:inline-block;width:100px;height:100px;border-radius:50%;background-color:\${gradeColor};line-height:100px;"><span style="font-size:48px;font-weight:700;color:white;">\${overall}</span></div><p style="margin:12px 0 0 0;color:#7f8c8d;font-size:13px;">Original listing grade: <strong>\${originalGrade}</strong></p></div><div style="padding:30px 20px;"><div style="margin-bottom:30px;"><h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #3498db;padding-bottom:10px;">A-Grade Rewrite</h2><p style="margin:0;color:#34495e;line-height:1.8;font-size:14px;white-space:pre-wrap;background-color:#f8f9fa;padding:15px;border-radius:6px;border-left:4px solid #3498db;">\${rewrite}</p></div><div style="margin-bottom:30px;"><h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #e74c3c;padding-bottom:10px;">Key Recommendations</h2><ol style="margin:0;padding-left:20px;color:#34495e;">\${recsHtml}</ol></div><div style="text-align:center;margin:30px 0;"><a href="https://get
    await submissionRef.update({
      status: 'completed',
      analysis,
      completedAt: new Date().toISOString(),
      email,
      propertyDetails,
    });

    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const overall = String(analysis.overall || '');
        const originalGrade = String(analysis.originalGrade || '');
        const rewrite = String(analysis.rewrite || '');
        const recs: string[] = Array.isArray(analysis.recommendations)
          ? (analysis.recommendations as string[])
          : [];
        const gradeColor =
          overall === 'A'
            ? '#27ae60'
            : overall === 'B'
              ? '#f39c12'
              : overall === 'C'
                ? '#e74c3c'
                : overall === 'D'
                  ? '#c0392b'
                  : '#95a5a6';
        const recsHtml = recs
          .map((rec: string) => `<li style="margin:12px 0;color:#2c3e50;line-height:1.6;">${rec}</li>`)
          .join('');
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f9fa;"><div style="max-width:600px;margin:0 auto;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);padding:40px 20px;text-align:center;color:white;"><h1 style="margin:0;font-size:28px;font-weight:700;">GetReadyToPost</h1><p style="margin:8px 0 0 0;font-size:14px;opacity:0.9;">Real Estate Listing Analysis Report</p></div><div style="background-color:#ecf0f1;padding:30px 20px;text-align:center;"><p style="margin:0 0 8px 0;color:#7f8c8d;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Rewrite Grade</p><div style="display:inline-block;width:100px;height:100px;border-radius:50%;background-color:${gradeColor};line-height:100px;"><span style="font-size:48px;font-weight:700;color:white;">${overall}</span></div><p style="margin:12px 0 0 0;color:#7f8c8d;font-size:13px;">Original listing grade: <strong>${originalGrade}</strong></p></div><div style="padding:30px 20px;"><div style="margin-bottom:30px;"><h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #3498db;padding-bottom:10px;">A-Grade Rewrite</h2><p style="margin:0;color:#34495e;line-height:1.8;font-size:14px;white-space:pre-wrap;background-color:#f8f9fa;padding:15px;border-radius:6px;border-left:4px solid #3498db;">${rewrite}</p></div><div style="margin-bottom:30px;"><h2 style="margin:0 0 15px 0;color:#2c3e50;font-size:18px;font-weight:600;border-bottom:3px solid #e74c3c;padding-bottom:10px;">Key Recommendations</h2><ol style="margin:0;padding-left:20px;color:#34495e;">${recsHtml}</ol></div><div style="text-align:center;margin:30px 0;"><a href="https://getreadytopost.com/results?id=${submissionId}" style="display:inline-block;background:linear-gradient(135deg,#3498db 0%,#2980b9 100%);color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">View Full Report</a></div></div><div style="background-color:#ecf0f1;padding:20px;text-align:center;border-top:1px solid #bdc3c7;"><p style="margin:0;color:#7f8c8d;font-size:12px;"><strong>GetReadyToPost</strong> - Real Estate Listing Analysis<br><span style="opacity:0.7;">Helping agents and sellers create winning listings</span></p></div></div></body></html>`;
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: `Your GetReadyToPost Report - Rewrite Grade ${overall} (Original: ${originalGrade})`,
          html,
        });
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
