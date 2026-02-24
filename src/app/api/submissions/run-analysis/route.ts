import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { gradeAndRewriteListing } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const submissionRef = adminDb.collection('submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissionDoc.data();
    const listingText = submission?.listingText;

    if (!listingText) {
      return NextResponse.json({ error: 'No listing text found' }, { status: 400 });
    }

    const analysis = await gradeAndRewriteListing(listingText);

    await submissionRef.update({
      analysis,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Run analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to run analysis' }, { status: 500 });
  }
}
