import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

const GOOGLE_STREET_VIEW_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing');
  let sa: any;
  try {
    sa = JSON.parse(json);
  } catch (e: any) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e?.message || String(e)}`);
  }
  if (!sa.private_key) {
    throw new Error('Service account missing private_key');
  }
  sa.private_key = sa.private_key.replace(/\\n/g, '\n');
  initializeApp({ credential: cert(sa) });
}

async function resolveUserDocId(db: any, userIdOrEmail: string): Promise<string | null> {
  const raw = String(userIdOrEmail || '').trim();
  if (!raw) return null;
  if (raw.includes('@')) {
    const qs = await db.collection('users').where('email', '==', raw.toLowerCase()).limit(1).get();
    if (qs.empty) return null;
    return qs.docs[0].id;
  }
  return raw;
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const { listingId, userId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Resolve user ID (handle email or doc ID)
    const resolvedUserDocId = await resolveUserDocId(db, String(userId));
    if (!resolvedUserDocId) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Check listing exists
    const listingRef = db.collection('listings').doc(listingId);
    const listingSnap = await listingRef.get();
    if (!listingSnap.exists()) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listingData = listingSnap.data() as any;

    // If photo already unlocked, return it
    if (listingData.googlePhoto?.downloadURL) {
      return NextResponse.json({ googlePhoto: listingData.googlePhoto }, { status: 200 });
    }

    const address = listingData.address || '';
    if (!address) {
      return NextResponse.json({ error: 'No address found in listing' }, { status: 400 });
    }

    if (!GOOGLE_STREET_VIEW_API_KEY) {
      return NextResponse.json({ error: 'Missing Google Street View API key' }, { status: 500 });
    }

    // Check user has credits
    const userRef = db.collection('users').doc(resolvedUserDocId);
    const balanceRef = userRef.collection('credits').doc('balance');
    const balSnap = await balanceRef.get();
    const currentBalance = balSnap.exists ? Number(balSnap.data()?.balance || 0) : 0;

    if (currentBalance <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Deduct 1 credit and unlock photo in transaction
    const result = await db.runTransaction(async (tx: any) => {
      const newBalance = currentBalance - 1;

      // Update user balance
      tx.set(balanceRef, { balance: newBalance }, { merge: true });

      // Create transaction record
      const txnRef = userRef.collection('transactions').doc();
      tx.set(txnRef, {
        type: 'deduct',
        amount: -1,
        newBalance,
        listingId,
        reason: 'google_photo_unlock',
        timestamp: new Date().toISOString(),
      });

      // Build and save photo data
      const encodedAddress = encodeURIComponent(address);
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${encodedAddress}&key=${GOOGLE_STREET_VIEW_API_KEY}`;

      const googlePhoto = {
        downloadURL: streetViewUrl,
        source: 'streetview' as const,
        unlockedAt: new Date().toISOString(),
        unlockedBy: resolvedUserDocId,
      };

      tx.set(listingRef, { googlePhoto }, { merge: true });

      return { googlePhoto, newBalance };
    });

    return NextResponse.json(
      {
        success: true,
        googlePhoto: result.googlePhoto,
        newBalance: result.newBalance,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const msg = String(error?.message || error || 'Server error');
    console.error('[fetch-google-photo] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
