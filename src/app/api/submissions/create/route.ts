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
    throw new Error('Firebase Admin credentials missing');
  }
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('STEP_1: POST called');
    initAdmin();console.log('DEBUG_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
    console.log('STEP_2: Firebase Admin initialized');

    const db = getFirestore();
    console.log('STEP_3: Firestore instance obtained');

    const body = await req.json();
    console.log('STEP_4: Request body parsed', { email: body?.email, hasListing: !!body?.listingDescription });

    const { listingDescription, email, address, city, state, zip, beds, baths, sqft, yearBuilt, price, hoa, hoaAmount } = body;

    if (!listingDescription?.trim() || !email?.trim()) {
      console.log('STEP_5: Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'listingDescription and email are required' },
        { status: 400 }
      );
    }
    console.log('STEP_5: Validation passed');

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
    console.log('STEP_6: Submission object built');

    const docRef = await db.collection('submissions').add(submission);
    console.log('STEP_7: Document written to Firestore', { docId: docRef.id, projectId: process.env.FIREBASE_ADMIN_PROJECT_ID });

    await docRef.update({
      'debug.createConfirmed': true,
      'debug.createConfirmedAt': new Date().toISOString(),
      'debug.projectId': process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
    console.log('STEP_8: Debug breadcrumb written');

    return NextResponse.json({ submissionId: docRef.id, ok: true });
  } catch (e: any) {
    console.error('CREATE_ERROR_FATAL:', { message: e?.message, code: e?.code });
    return NextResponse.json(
      { error: `Create failed: ${e?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
