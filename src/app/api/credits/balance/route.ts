import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const adminDb = getAdminDb();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ balance: 0 });
    }

    const data = userDoc.data();
    const balance = data?.credits?.balance || 0;

    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Get balance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch balance' }, { status: 500 });
  }
}
