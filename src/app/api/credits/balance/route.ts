import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const db = getFirestore();
    const balanceDoc = await db
      .collection('users')
      .doc(userId)
      .collection('credits')
      .doc('balance')
      .get();

    const balance = balanceDoc.exists ? (balanceDoc.data()?.balance ?? 0) : 0;

    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Balance error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
