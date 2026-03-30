import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_ENV = process.env.SQUARE_ENV || 'production';
const BASE_URL = SQUARE_ENV === 'sandbox'
  ? 'https://connect.squareupsandbox.com'
  : 'https://connect.squareup.com';

const PACKAGE_MAP: Record<string, {
  amount: number;
  credits: number;
  type: 'one-time' | 'subscription';
  billingCycle: string | null;
  propertyPullPrice: number;
  vaultAccess: boolean;
  workspaceAccess: boolean;
}> = {
  'credit':               { amount: 0,     credits: 0,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'single':               { amount: 1999,  credits: 1,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  '5pack':                { amount: 8500,  credits: 5,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'monthly':              { amount: 3000,  credits: 30,  type: 'subscription', billingCycle: 'monthly',    propertyPullPrice: 3.0,  vaultAccess: true,  workspaceAccess: true },
  'semi-annual':          { amount: 49500, credits: 300, type: 'subscription', billingCycle: 'semi-annual', propertyPullPrice: 2.5,  vaultAccess: true,  workspaceAccess: true },
  'annual':               { amount: 89900, credits: 450, type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 1.75, vaultAccess: true,  workspaceAccess: true },
  'elite-annual':         { amount: 99900, credits: 899, type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 1.0,  vaultAccess: true,  workspaceAccess: true },
  'vault-only':           { amount: 4995,  credits: 0,   type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 0,    vaultAccess: true,  workspaceAccess: false },
  'fsbo-launch':          { amount: 10000, credits: 100, type: 'one-time',    billingCycle: null,          propertyPullPrice: 3.0,  vaultAccess: true,  workspaceAccess: true },
};

function getRenewalDate(billingCycle: string): Date {
  const d = new Date();
  if (billingCycle === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (billingCycle === 'semi-annual') d.setMonth(d.getMonth() + 6);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
}

async function handleValidation(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const squareOrderId = searchParams.get('orderId');
    const passedUserId = searchParams.get('userId');

    if (!squareOrderId) {
      return NextResponse.json(
        { success: false, message: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!SQUARE_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, message: 'Server config error' },
        { status: 500 }
      );
    }

    const adminDb = getAdminDb();

    // ─── CHECK 1: Already fulfilled by webhook? ─────────────────────────
    const processedSnap = await adminDb
      .collection('webhook_processed')
      .where('squareOrderId', '==', squareOrderId)
      .where('status', '==', 'completed')
      .limit(1)
      .get();

    if (!processedSnap.empty) {
      const processed = processedSnap.docs[0].data();
      const userId = processed.userId;

      // Fetch transaction details
      const txSnap = await adminDb
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .where('squareOrderId', '==', squareOrderId)
        .limit(1)
        .get();

      if (!txSnap.empty) {
        const tx = txSnap.docs[0].data();
        console.log(`[Validate] Already fulfilled by webhook — userId=${userId}`);
        return NextResponse.json({
          success: true,
          transaction: {
            squarePaymentId: tx.squarePaymentId || '',
            squareOrderId,
            amount: Math.round(tx.revenue * 100),
            credits: tx.creditsAdded,
            packageType: tx.packageType,
            status: 'completed',
            userId,
            createdAt: tx.timestamp,
          },
        });
      }
    }
    // ─── CHECK 2: Call Square directly for order details ───────────────
    console.log(`[Validate] Fetching order from Square — orderId=${squareOrderId}`);

    const orderResp = await fetch(`${BASE_URL}/v2/orders/${squareOrderId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    if (!orderResp.ok) {
      const errText = await orderResp.text();
      console.error('[Validate] Failed to fetch order from Square:', errText);
      return NextResponse.json(
        { success: false, message: 'Could not verify payment with Square' },
        { status: 404 }
      );
    }

    const orderData = await orderResp.json();
    const order = orderData.order;

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found in Square' },
        { status: 404 }
      );
    }

    // ─── Confirm order is paid ──────────────────────────────────────────
    const orderState = order.state;
    const tenders = order.tenders || [];
    const hasPaidTender = tenders.some(
      (t: any) => t.type === 'CARD' && t.card_details?.status === 'CAPTURED'
    );

    if (orderState !== 'COMPLETED' && !hasPaidTender) {
      console.log(`[Validate] Order not paid — state=${orderState} tenders=${tenders.length}`);
      return NextResponse.json(
        { success: false, message: `Payment not completed yet (${orderState})` },
        { status: 404 }
      );
    }

    // ─── Extract order details ──────────────────────────────────────────
    const userId = order.reference_id || passedUserId;
    const lineItem = order?.line_items?.[0];
    const lineName = lineItem?.name || '';
    const amountCents = lineItem?.base_price_money?.amount || 0;
    const metadataPackageType = order?.metadata?.packageType || '';

    console.log(`[Validate] Order COMPLETED — userId=${userId} package=${metadataPackageType} amount=${amountCents}`);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'No userId on order' },
        { status: 404 }
      );
    }

    // ─── Resolve package type ───────────────────────────────────────────
    let packageType = metadataPackageType.toLowerCase().trim();

    // Handle dynamic credit purchases
    let creditsToAdd = 0;
    let resolvedAmount = amountCents;

    if (packageType === 'credit') {
      creditsToAdd = Math.round(amountCents / 100);
    } else if (PACKAGE_MAP[packageType]) {
      creditsToAdd = PACKAGE_MAP[packageType].credits;
    } else {
      // Fallback: resolve from line name
      const normalized = lineName.toLowerCase().replace(/[\s\-_]+/g, '');
      if (normalized.includes('eliteannual')) packageType = 'elite-annual';
      else if (normalized.includes('fsbolaunch')) packageType = 'fsbo-launch';
      else if (normalized.includes('vaultonly')) packageType = 'vault-only';
      else if (normalized.includes('semiannual')) packageType = 'semi-annual';
      else if (normalized.includes('monthly')) packageType = 'monthly';
      else if (normalized.includes('annual')) packageType = 'annual';
      else packageType = 'credit';

      creditsToAdd = PACKAGE_MAP[packageType]?.credits || Math.round(amountCents / 100);
    }

    const pkg = PACKAGE_MAP[packageType];

    // ─── IDEMPOTENCY: Don't double-fulfill ─────────────────────────────
    const alreadyDone = await adminDb
      .collection('webhook_processed')
      .where('squareOrderId', '==', squareOrderId)
      .limit(1)
      .get();

    if (!alreadyDone.empty) {
      const done = alreadyDone.docs[0].data();
      if (done.status === 'completed') {
        console.log(`[Validate] Already fulfilled — skipping double write`);
        return NextResponse.json({
          success: true,
          transaction: {
            squarePaymentId: done.squarePaymentId || '',
            squareOrderId,
            amount: resolvedAmount,
            credits: creditsToAdd,
            packageType,
            status: 'completed',
            userId,
          },
        });
      }
    }

    // ─── FULFILL: Write credits to Firebase ────────────────────────────
    const userRef = adminDb.collection('users').doc(userId);

    if (creditsToAdd > 0) {
      await userRef.collection('credits').doc('balance').set(
        {
          balance: FieldValue.increment(creditsToAdd),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // ─── Write subscription if applicable ──────────────────────────────
    if (pkg && pkg.type === 'subscription' && pkg.billingCycle) {
      await userRef.set(
        {
          subscription: {
            planId: packageType,
            status: 'active',
            creditsPerCycle: pkg.credits,
            propertyPullPrice: pkg.propertyPullPrice,
            vaultAccess: pkg.vaultAccess,
            workspaceAccess: pkg.workspaceAccess,
            billingCycle: pkg.billingCycle,
            renewalDate: getRenewalDate(pkg.billingCycle),
            lastPaymentDate: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    }

    // ─── Write transaction record ───────────────────────────────────────
    await userRef.collection('transactions').add({
      packageType,
      creditsAdded: creditsToAdd,
      revenue: resolvedAmount / 100,
      squarePaymentId: '',
      squareOrderId,
      billingCycle: pkg?.billingCycle || null,
      subscriptionApplied: pkg?.type === 'subscription',
      source: 'validate-transaction',
      status: 'completed',
      timestamp: FieldValue.serverTimestamp(),
    });

    // ─── Mark as processed ─────────────────────────────────────────────
    await adminDb.collection('webhook_processed').add({
      squarePaymentId: '',
      squareOrderId,
      userId,
      packageType,
      creditsAdded: creditsToAdd,
      status: 'completed',
      processedAt: FieldValue.serverTimestamp(),
    });

    console.log(`[Validate] Fulfilled directly — ${packageType} ${creditsToAdd} credits for ${userId}`);

    return NextResponse.json({
      success: true,
      transaction: {
        squarePaymentId: '',
        squareOrderId,
        amount: resolvedAmount,
        credits: creditsToAdd,
        packageType,
        status: 'completed',
        userId,
      },
    });

  } catch (error) {
    console.error('[Validate] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleValidation(req);
}

export async function POST(req: NextRequest) {
  return handleValidation(req);
}
