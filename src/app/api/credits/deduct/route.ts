import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { userId, listingId } = await req.json();
    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const adminDb = getAdminDb();
    const userCreditsRef = adminDb.collection('users').doc(userId).collection('credits').doc('balance');
    await userCreditsRef.set({ balance: FieldValue.increment(-1) }, { merge: true });
    const transactionsRef = adminDb.collection('users').doc(userId).collection('transactions');
    await transactionsRef.add({ type: 'usage', creditsDeducted: 1, listingId, timestamp: FieldValue.serverTimestamp(), source: 'listing-analysis' });
    const submissionRef = adminDb.collection('submissions').doc(listingId);
    await submissionRef.set({ status: 'paid', paymentMethod: 'credit', paidAt: FieldValue.serverTimestamp() }, { merge: true });
    const balanceDoc = await userCreditsRef.get();
    const newBalance = balanceDoc.data()?.balance || 0;
    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return NextResponse.json({ error: 'Failed to deduct credit', details: String(error) }, { status: 500 });
  }
}
