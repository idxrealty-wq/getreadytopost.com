import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
    const { userId, listingId } = await req.json();

    if (!userId || !listingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userCreditsRef = doc(db, 'users', userId, 'credits', 'balance');
    const creditsSnap = await getDoc(userCreditsRef);
    const currentBalance = creditsSnap.exists() ? creditsSnap.data().balance : 0;

    if (currentBalance < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // Deduct 1 credit
    await setDoc(userCreditsRef, { balance: increment(-1) }, { merge: true });

    // Log transaction
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    await addDoc(transactionsRef, {
      type: 'deduction',
      creditsDeducted: 1,
      listingId,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true, newBalance: currentBalance - 1 });
  } catch (error) {
    console.error('Deduct credits error:', error);
    return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
  }
}
