import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../../data/serviceAccount.json';

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
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

