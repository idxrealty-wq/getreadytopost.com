import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const balanceDoc = await adminDb.collection('users').doc(userId).collection('credits').doc('balance').get();

    if (!balanceDoc.exists) {
      return NextResponse.json({ balance: 0 });
    }

    const balance = balanceDoc.data()?.balance || 0;
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json({ error: 'Failed to fetch balance', details: String(error) }, { status: 500 });
  }
}
