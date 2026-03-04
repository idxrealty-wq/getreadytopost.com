import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

export async function POST(req: NextRequest) {
  try {
    const { userId, creditsAmount, transactionId, packageType } = await req.json();

    if (!userId || !creditsAmount || !transactionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userCreditsRef = doc(db, 'users', userId, 'credits', 'balance');
    const transactionsRef = collection(db, 'users', userId, 'transactions');

    // Add credits to user balance
    await setDoc(userCreditsRef, { balance: increment(creditsAmount) }, { merge: true });

    // Log transaction
    await addDoc(transactionsRef, {
      type: 'purchase',
      creditsAdded: creditsAmount,
      packageType: packageType || 'single',
      transactionId,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true, creditsAdded: creditsAmount });
  } catch (error) {
    console.error('Purchase credits error:', error);
    return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
  }
}
