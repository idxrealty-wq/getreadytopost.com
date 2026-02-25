import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    console.log('Balance endpoint called for userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    console.log('User doc exists:', userDoc.exists);

    if (!userDoc.exists) {
      console.log('User doc not found, returning 0');
      return NextResponse.json({ balance: 0 });
    }

    const data = userDoc.data();
    console.log('User doc data:', data);

    const balance = data?.credits?.balance || 0;
    console.log('Extracted balance:', balance);

    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Get balance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch balance' }, { status: 500 });
  }
}
