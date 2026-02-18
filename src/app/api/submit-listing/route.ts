export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { email, listingText } = await req.json();

    if (!email || !listingText) {
      return NextResponse.json({ error: 'Email and listing text are required' }, { status: 400 });
    }

    // Save submission as pending_payment - AI grading happens after payment
    const submissionRef = await addDoc(collection(db, 'submissions'), {
      email,
      listingText,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, submissionId: submissionRef.id });
  } catch (error: any) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
