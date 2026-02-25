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

    console.log("About to update submission to completed:", submissionId);
    try {
      await submissionRef.update({
        status: "completed",
        analysis,
        completedAt: new Date().toISOString(),
      });
      console.log("Successfully updated submission to completed");
    } catch (e) {
      console.error("Failed to update submission status:", e);
      throw e;
    }

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
    console.log("About to update submission to completed:", submissionId);
    try {
      await submissionRef.update({
        status: "completed",
        analysis,
        completedAt: new Date().toISOString(),
      });
      console.log("Successfully updated submission to completed");
    } catch (e) {
      console.error("Failed to update submission status:", e);
      throw e;
    }
    }

    const openaiData = await openaiRes.json();
    const rawContent = openaiData.choices?.[0]?.message?.content || '{}';
    const analysis = JSON.parse(rawContent);

    console.log("About to update submission to completed:", submissionId);
    try {
      await submissionRef.update({
        status: "completed",
        analysis,
        completedAt: new Date().toISOString(),
      });
      console.log("Successfully updated submission to completed");
    } catch (e) {
      console.error("Failed to update submission status:", e);
      throw e;
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Run analysis error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
