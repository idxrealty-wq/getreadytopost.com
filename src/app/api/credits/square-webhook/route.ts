import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

function verifySquareSignature(body: string, signature: string): boolean {
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    console.warn('[Webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set, skipping verification');
    return true;
  }
  const hash = crypto
    .createHmac('sha256', SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(body)
    .digest('base64');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-square-hmac-sha256') || '';

    if (!verifySquareSignature(body, signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(body);
    const eventType = data.type;
    console.log(`[Webhook] Received event: ${eventType}`);

    if (eventType !== 'payment.created') {
      return NextResponse.json({ success: true });
    }

    const payment = data.data?.object?.payment;
    if (!payment) {
      console.log('[Webhook] No payment object found');
      return NextResponse.json({ success: true });
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;

    if (!orderId) {
      console.log('[Webhook] No order_id on payment');
      return NextResponse.json({ success: true });
    }

    console.log(`[Webhook] Processing payment ${paymentId} for orderId: ${orderId}`);

    const adminDb = getAdminDb();
    const processedRef = adminDb.collection('webhook_processed').doc(paymentId);
    const processedSnap = await processedRef.get();

    if (processedSnap.exists) {
      console.log(`[Webhook] Payment ${paymentId} already processed, skipping`);
      return NextResponse.json({ success: true, idempotent: true });
    }

    const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
    const orderResp = await fetch(
      `https://connect.squareup.com/v2/orders/${orderId}`,
      {
        headers: {
          'Square-Version': '2024-01-18',
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        },
      }
    );

    const orderText = await orderResp.text();
    if (!orderResp.ok) {
      console.error('[Webhook] Failed to fetch order:', orderText);
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

    const orderData = JSON.parse(orderText);
    const userId = orderData.order?.reference_id;
    const lineName = (orderData.order?.line_items?.[0]?.name || '').toLowerCase();

    if (!userId) {
      console.error('[Webhook] No userId (reference_id) on order');
      return NextResponse.json({ error: 'No userId on order' }, { status: 500 });
    }

    let creditsToAdd = 0;
    if (lineName.includes('single')) creditsToAdd = 1;
    else if (lineName.includes('5pack')) creditsToAdd = 5;
    else if (lineName.includes('monthly')) creditsToAdd = 99;
    else if (lineName.includes('6month')) creditsToAdd = 495;
    else if (lineName.includes('annual')) creditsToAdd = 899;
    else if (lineName.includes('credit')) {
      const quantity = orderData.order?.line_items?.[0]?.quantity || '1';
      creditsToAdd = parseInt(quantity, 10);
    }

    if (!creditsToAdd) {
      console.error('[Webhook] Could not determine credits from order:', lineName);
      return NextResponse.json({ error: 'Could not determine credits' }, { status: 500 });
    }

    console.log(`[Webhook] Crediting userId ${userId} with ${creditsToAdd} credits`);

    const userCreditsRef = adminDb.collection('users').doc(userId).collection('credits').doc('balance');
    await userCreditsRef.set(
      { balance: FieldValue.increment(creditsToAdd) },
      { merge: true }
    );

    const transactionsRef = adminDb.collection('users').doc(userId).collection('transactions');
    await transactionsRef.add({
      type: 'purchase',
      creditsAdded: creditsToAdd,
      orderId,
      paymentId,
      timestamp: FieldValue.serverTimestamp(),
      source: 'square-webhook',
    });

    await processedRef.set({
      paymentId,
      orderId,
      userId,
      creditsAdded: creditsToAdd,
      processedAt: FieldValue.serverTimestamp(),
    });

    console.log(`[Webhook] Successfully credited ${creditsToAdd} credits to ${userId}`);
    return NextResponse.json({ success: true, userId, creditsAdded: creditsToAdd });
  } catch (e: any) {
    console.error('[Webhook] Error:', e);
    await import("@/lib/logError").then(({ logError }) =>
      logError({ source: "square-webhook", error: e, context: {} })
    );
    return NextResponse.json({ error: 'Failed', details: String(e) }, { status: 500 });
  }
}
