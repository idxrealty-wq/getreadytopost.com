import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    console.log('Webhook received:', type);

    if (type !== 'payment.created') {
      return NextResponse.json({ received: true });
    }

    const payment = data.object.payment;
    const { id: paymentId, order_id } = payment;

    console.log('Payment ID:', paymentId, 'Order ID:', order_id);

    if (!paymentId || !order_id) {
      console.warn('Missing payment or order ID');
      return NextResponse.json({ received: true });
    }

    // Fetch the order to get reference_id (userId)
    const orderResp = await fetch(`https://connect.squareup.com/v2/orders/${order_id}`, {
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    if (!orderResp.ok) {
      console.error('Failed to fetch order from Square');
      return NextResponse.json({ received: true });
    }

    const orderData = await orderResp.json();
    const userId = orderData.order.reference_id;

    console.log('User ID from order:', userId);

    if (!userId) {
      console.warn('No reference_id (userId) in order');
      return NextResponse.json({ received: true });
    }

    // Determine credits from order line items
    let creditsToAdd = 0;
    if (orderData.order.line_items && orderData.order.line_items.length > 0) {
      const lineItem = orderData.order.line_items[0];
      const itemName = lineItem.name.toLowerCase();

      // Map item names to credits
      if (itemName.includes('test')) creditsToAdd = 1;
      else if (itemName.includes('single')) creditsToAdd = 1;
      else if (itemName.includes('5pack')) creditsToAdd = 5;
      else if (itemName.includes('monthly')) creditsToAdd = 99;
      else if (itemName.includes('6month')) creditsToAdd = 495;
      else if (itemName.includes('annual')) creditsToAdd = 899;
    }

    console.log('Credits to add:', creditsToAdd);

    if (creditsToAdd === 0) {
      console.warn('Could not determine credits from order');
      return NextResponse.json({ received: true });
    }

    // Add credits to user
    const userCreditsRef = doc(db, 'users', userId, 'credits', 'balance');
    await setDoc(userCreditsRef, { balance: increment(creditsToAdd) }, { merge: true });

    // Log transaction
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    await addDoc(transactionsRef, {
      type: 'purchase',
      creditsAdded: creditsToAdd,
      paymentId,
      orderId: order_id,
      timestamp: serverTimestamp(),
    });

    console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true });
  }
}
