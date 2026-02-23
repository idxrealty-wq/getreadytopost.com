import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Map Square payment links to credit amounts
const PAYMENT_LINK_MAP: Record<string, { credits: number; package: string }> = {
  '22tY4Rla': { credits: 1, package: 'single' },
  '15NaVu0p': { credits: 5, package: '5-pack' },
  'PUNuh53u': { credits: 99, package: 'monthly' },
  '8nf73LLz': { credits: 495, package: '6-month' },
  'lgsIomQl': { credits: 899, package: 'annual' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Only process payment.created events
    if (type !== 'payment.created') {
      return NextResponse.json({ received: true });
    }

    const payment = data.object.payment;
    const { id: transactionId, amount_money, customer_id, receipt_url } = payment;

    if (!transactionId || !customer_id) {
      return NextResponse.json({ error: 'Missing transaction or customer ID' }, { status: 400 });
    }

    // Determine credits based on amount (in cents)
    let creditsToAdd = 0;
    let packageType = 'unknown';

    // Match by amount (in cents)
    const amountInCents = amount_money?.amount || 0;
    if (amountInCents === 1999) {
      creditsToAdd = 1;
      packageType = 'single';
    } else if (amountInCents === 8500) {
      creditsToAdd = 5;
      packageType = '5-pack';
    } else if (amountInCents === 9900) {
      creditsToAdd = 99;
      packageType = 'monthly';
    } else if (amountInCents === 49500) {
      creditsToAdd = 495;
      packageType = '6-month';
    } else if (amountInCents === 89900) {
      creditsToAdd = 899;
      packageType = 'annual';
    }

    if (creditsToAdd === 0) {
      console.warn(`Unknown payment amount: ${amountInCents}`);
      return NextResponse.json({ received: true });
    }

    // Add credits to user (use customer_id as userId)
    const userCreditsRef = doc(db, 'users', customer_id, 'credits', 'balance');
    await setDoc(userCreditsRef, { balance: increment(creditsToAdd) }, { merge: true });

    // Log transaction
    const transactionsRef = collection(db, 'users', customer_id, 'transactions');
    await addDoc(transactionsRef, {
      type: 'purchase',
      creditsAdded: creditsToAdd,
      packageType,
      transactionId,
      receiptUrl: receipt_url,
      amount: amountInCents,
      timestamp: serverTimestamp(),
    });

    console.log(`Added ${creditsToAdd} credits to user ${customer_id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Square webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
