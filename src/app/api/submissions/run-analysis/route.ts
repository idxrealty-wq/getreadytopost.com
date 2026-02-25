import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

    const data = submissionDoc.data();
    const listingText = data?.listingText || '';

    await submissionRef.update({ status: 'processing' });

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a real estate listing expert. Analyze the listing and return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "overall": "A",
  "rewrite": "Your improved listing text here",
  "categories": {
    "headline": { "grade": "A", "feedback": "feedback text" },
    "length": { "grade": "B", "feedback": "feedback text" },
    "emotion": { "grade": "A", "feedback": "feedback text" },
    "keywords": { "grade": "B", "feedback": "feedback text" },
    "cta": { "grade": "A", "feedback": "feedback text" },
    "professionalism": { "grade": "A", "feedback": "feedback text" }
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`,
          },
          {
            role: 'user',
            content: `Analyze this real estate listing:\n\n${listingText}`,
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
    const rawContent = openaiData.choices?.[0]?.message?.content || '{}';
    const analysis = JSON.parse(rawContent);

      console.log("About to update submission to completed:", submissionId);
    await submissionRef.update({
      status: 'completed',
      analysis,
      completedAt: new Date().toISOString(),
    });
      console.log("Successfully updated submission to completed");

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Run analysis error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
