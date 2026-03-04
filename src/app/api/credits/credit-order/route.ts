import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

    const orderResp = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    const orderText = await orderResp.text();
    if (!orderResp.ok) {
      return NextResponse.json({ error: 'Failed to fetch order', details: orderText }, { status: 500 });
    }

    const orderData = JSON.parse(orderText);
    const userId = orderData.order?.reference_id;
    const lineName = (orderData.order?.line_items?.[0]?.name || '').toLowerCase();

    let creditsToAdd = 0;
    if (lineName.includes('single')) creditsToAdd = 1;
    else if (lineName.includes('5pack')) creditsToAdd = 5;
    else if (lineName.includes('monthly')) creditsToAdd = 99;
    else if (lineName.includes('6month')) creditsToAdd = 495;
    else if (lineName.includes('annual')) creditsToAdd = 899;

    if (!userId) return NextResponse.json({ error: 'No userId on order.reference_id', details: orderData }, { status: 500 });
    if (!creditsToAdd) return NextResponse.json({ error: 'Could not determine credits from order', details: orderData }, { status: 500 });

    const adminDb = getAdminDb();

    const userCreditsRef = adminDb.collection('users').doc(userId).collection('credits').doc('balance');
    await userCreditsRef.set({ balance: FieldValue.increment(creditsToAdd) }, { merge: true });

    const transactionsRef = adminDb.collection('users').doc(userId).collection('transactions');
    await transactionsRef.add({
      type: 'purchase',
      creditsAdded: creditsToAdd,
      orderId,
      timestamp: FieldValue.serverTimestamp(),
      source: 'manual-credit-order',
    });

    return NextResponse.json({ success: true, userId, creditsAdded: creditsToAdd });
  } catch (e) {
    console.error('Credit order error:', e);
    return NextResponse.json({ error: 'Failed', details: String(e) }, { status: 500 });
  }
}
