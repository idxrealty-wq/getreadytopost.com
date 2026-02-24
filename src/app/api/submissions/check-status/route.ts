import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const submissionRef = adminDb.collection('submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const data = submissionDoc.data();

    return NextResponse.json({
      status: data?.status || 'pending',
      analysis: data?.analysis || null,
      error: data?.error || null,
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check status' }, { status: 500 });
  }
}
