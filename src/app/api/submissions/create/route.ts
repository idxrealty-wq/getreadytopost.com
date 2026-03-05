import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  if (getApps().length > 0) return;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Firebase Admin init failed. Missing: ${!projectId ? 'PROJECT_ID ' : ''}${!clientEmail ? 'CLIENT_EMAIL ' : ''}${!privateKey ? 'PRIVATE_KEY' : ''}`
    );
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const body = await req.json();
    const { listingDescription, email, address, city, state, zip, beds, baths, sqft, yearBuilt, price, hoa, hoaAmount } = body;

    if (!listingDescription?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'listingDescription and email are required' },
        { status: 400 }
      );
    }

    const submission = {
      listingText: listingDescription,
      email,
      propertyDetails: {
        address: address || '',
        city: city || '',
        state: state || '',
        zip: zip || '',
        beds: beds ? parseInt(String(beds)) : null,
        baths: baths ? parseFloat(String(baths)) : null,
        sqft: sqft ? parseInt(String(sqft)) : null,
        yearBuilt: yearBuilt ? parseInt(String(yearBuilt)) : null,
        price: price ? parseInt(String(price).replace(/,/g, '')) : null,
        hoa: hoa === 'yes',
        hoaAmount: hoaAmount ? parseFloat(String(hoaAmount).replace(/,/g, '')) : null,
      },
      status: 'created',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('submissions').add(submission);console.error('FIRESTORE_WRITE_SUCCESS:', docRef.id);

    return NextResponse.json({ submissionId: docRef.id, ok: true });
  } catch (e: any) {
    const errorMsg = `CREATE_ERROR: ${e?.message || 'Unknown'} | Code: ${e?.code || 'N/A'}`;
console.error(errorMsg, e?.stack);
return NextResponse.json(
  { error: errorMsg },
  { status: 500 }
);
}
}
