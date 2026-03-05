import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  initAdmin();
  const db = getFirestore();

  try {
    const body = await req.json();
    const { listingDescription, email, address, city, state, zip, beds, baths, sqft, yearBuilt, price, hoa, hoaAmount } = body;

    if (!listingDescription || !email) {
      return NextResponse.json({ error: 'listingDescription and email required' }, { status: 400 });
    }

    const submission = {
      listingText: listingDescription,
      email,
      propertyDetails: {
        address,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        yearBuilt,
        price,
        hoa,
        hoaAmount,
      },
      status: 'created',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('submissions').add(submission);

    return NextResponse.json({ submissionId: docRef.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
