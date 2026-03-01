import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'getreadtopost',
      clientEmail: 'firebase-adminsdk-fbsvc@getreadtopost.iam.gserviceaccount.com',
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const snapshot = await db
      .collection('parcels_orange')
      .where('search_key', '>=', q)
      .where('search_key', '<=', q + '\uf8ff')
      .limit(10)
      .get();

    const results = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
