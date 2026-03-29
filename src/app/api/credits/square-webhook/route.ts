import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_ENV = process.env.SQUARE_ENV || 'production';
const BASE_URL = SQUARE_ENV === 'sandbox'
  ? 'https://connect.squareupsandbox.com'
  : 'https://connect.squareup.com';

// ─── PACKAGE MAP ─────────────────────────────────────────────────────────────
// Identical to create-checkout. Single source of truth for fulfillment.
const PACKAGE_MAP: Record<string, {
  amount: number;
  credits: number;
  type: 'one-time' | 'subscription';
  billingCycle: string | null;
  propertyPullPrice: number;
  vaultAccess: boolean;
  workspaceAccess: boolean;
}> = {
  'single':               { amount: 1999,  credits: 1,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  '5pack':                { amount: 8500,  credits: 5,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'monthly':              { amount: 3000,  credits: 30,  type: 'subscription', billingCycle: 'monthly',    propertyPullPrice: 3.0,  vaultAccess: true,  workspaceAccess: true },
  'semi-annual':          { amount: 49500, credits: 300, type: 'subscription', billingCycle: 'semi-annual', propertyPullPrice: 2.5,  vaultAccess: true,  workspaceAccess: true },
  'annual':               { amount: 89900, credits: 450, type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 1.75, vaultAccess: true,  workspaceAccess: true },
  'elite-annual':         { amount: 99900, credits: 899, type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 1.0,  vaultAccess: true,  workspaceAccess: true },
  'vault-only':           { amount: 4995,  credits: 0,   type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 0,    vaultAccess: true,  workspaceAccess: false },
  'fsbo-launch':          { amount: 10000, credits: 100, type: 'one-time',    billingCycle: null,          propertyPullPrice: 3.0,  vaultAccess: true,  workspaceAccess: true },
  'agent-verified':       { amount: 1999,  credits: 0,   type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'company-verified':     { amount: 1000,  credits: 0,   type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'verify-my-agent':      { amount: 1000,  credits: 0,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'verified-buyer-seller':{ amount: 1000,  credits: 0,   type: 'one-time',    billingCycle: null,          propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
  'reverification':       { amount: 1000,  credits: 0,   type: 'subscription', billingCycle: 'annual',     propertyPullPrice: 0,    vaultAccess: false, workspaceAccess: false },
};

function verifySignature(body: string, signature: string): boolean {
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

function resolvePackage(metadataPackageType: string, lineName: string, amountCents: number): string | null {
  // Priority 1: exact match from metadata
  const metaKey = (metadataPackageType || '').toLowerCase().trim();
  if (metaKey && PACKAGE_MAP[metaKey]) return metaKey;

  // Priority 2: match from line item name
  const normalized = (lineName || '').toLowerCase().replace(/[\s\-_]+/g, '');
  if (normalized.includes('eliteannual')) return 'elite-annual';
  if (normalized.includes('fsbolaunch')) return 'fsbo-launch';
  if (normalized.includes('agentverified')) return 'agent-verified';
  if (normalized.includes('companyverified')) return 'company-verified';
  if (normalized.includes('verifymyagent')) return 'verify-my-agent';
  if (normalized.includes('verifiedbuyerseller')) return 'verified-buyer-seller';
  if (normalized.includes('reverification')) return 'reverification';
  if (normalized.includes('vaultonly') || normalized.includes('vault')) return 'vault-only';
  if (normalized.includes('semiannual') || normalized.includes('6month')) return 'semi-annual';
  if (normalized.includes('monthly')) return 'monthly';
  if (normalized.includes('annual')) return 'annual';
  if (normalized.includes('5pack')) return '5pack';
  if (normalized.includes('single')) return 'single';

  // Priority 3: match from amount
  const amountMap: Record<number, string> = {
    1999: 'single',
    8500: '5pack',
    3000: 'monthly',
    49500: 'semi-annual',
    89900: 'annual',
    99900: 'elite-annual',
    4995: 'vault-only',
    10000: 'fsbo-launch',
    1000: 'verify-my-agent',
  };
  if (amountMap[amountCents]) return amountMap[amountCents];

  return null;
}

function getRenewalDate(billingCycle: string): Date {
  const d = new Date();
  if (billingCycle === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (billingCycle === 'semi-annual') {
    d.setMonth(d.getMonth() + 6);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-square-hmac-sha256') || '';

    if (!verifySignature(body, signature)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(body);
    const eventType = data.type;

    console.log(`[Webhook] Event received: ${eventType}`);

    if (eventType !== 'payment.created') {
      return NextResponse.json({ success: true, ignored: eventType });
    }

    const payment = data.data?.object?.payment;
    if (!payment) {
      console.log('[Webhook] No payment object');
      return NextResponse.json({ success: true });
    }

    const squarePaymentId = payment.id;
    const squareOrderId = payment.order_id;

    if (!squareOrderId) {
      console.log('[Webhook] No order_id on payment');
      return NextResponse.json({ success: true });
    }

    console.log(`[Webhook] Processing squarePaymentId=${squarePaymentId} squareOrderId=${squareOrderId}`);

    const adminDb = getAdminDb();

    // ─── IDEMPOTENCY CHECK ───────────────────────────────────────────────
    const processedRef = adminDb.collection('webhook_processed').doc(squarePaymentId);
    const processedSnap = await processedRef.get();

    if (processedSnap.exists) {
      console.log(`[Webhook] Already processed ${squarePaymentId}, skipping`);
      return NextResponse.json({ success: true, idempotent: true });
    }

    await processedRef.set({
      squarePaymentId,
      squareOrderId,
      status: 'processing',
      createdAt: FieldValue.serverTimestamp(),
    });

    // ─── FETCH ORDER FROM SQUARE ─────────────────────────────────────────
    if (!SQUARE_ACCESS_TOKEN) {
      throw new Error('SQUARE_ACCESS_TOKEN is not set');
    }

    const orderResp = await fetch(`${BASE_URL}/v2/orders/${squareOrderId}`, {
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    if (!orderResp.ok) {
      const errText = await orderResp.text();
      console.error('[Webhook] Failed to fetch order:', errText);
      await processedRef.update({ status: 'failed', error: 'Failed to fetch order', failedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

    const orderData = await orderResp.json();
    const order = orderData.order;

    const userId = order?.reference_id;
    const lineItem = order?.line_items?.[0];
    const lineName = lineItem?.name || '';
    const amountCents = lineItem?.base_price_money?.amount || 0;
    const metadataPackageType = order?.metadata?.packageType || '';

    console.log(`[Webhook] userId=${userId} lineName=${lineName} amount=${amountCents} metadata=${metadataPackageType}`);

    if (!userId) {
      console.error('[Webhook] No userId (reference_id) on order');
      await processedRef.update({ status: 'failed', error: 'No userId on order', failedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ error: 'No userId on order' }, { status: 500 });
    }

    // ─── RESOLVE PACKAGE ─────────────────────────────────────────────────
    const packageType = resolvePackage(metadataPackageType, lineName, amountCents);

    if (!packageType) {
      console.error(`[Webhook] Unknown package: name=${lineName} amount=${amountCents} meta=${metadataPackageType}`);
      await processedRef.update({ status: 'failed', error: 'Unknown package', failedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ error: 'Unknown package' }, { status: 500 });
    }

    const pkg = PACKAGE_MAP[packageType];

    console.log(`[Webhook] Fulfilling ${packageType} for ${userId} — ${pkg.credits} credits`);

    // ─── WRITE CREDITS ───────────────────────────────────────────────────
    const userRef = adminDb.collection('users').doc(userId);

    if (pkg.credits > 0) {
      await userRef.collection('credits').doc('balance').set(
        {
          balance: FieldValue.increment(pkg.credits),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // ─── WRITE SUBSCRIPTION ──────────────────────────────────────────────
    if (pkg.type === 'subscription' && pkg.billingCycle) {
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

    // ─── WRITE TRANSACTION ───────────────────────────────────────────────
    await userRef.collection('transactions').add({
      packageType,
      creditsAdded: pkg.credits,
      revenue: pkg.amount / 100,
      squarePaymentId,
      squareOrderId,
      billingCycle: pkg.billingCycle || null,
      subscriptionApplied: pkg.type === 'subscription',
      source: 'square-webhook',
      status: 'completed',
      timestamp: FieldValue.serverTimestamp(),
    });

    // ─── MARK PROCESSED ──────────────────────────────────────────────────
    await processedRef.update({
      userId,
      packageType,
      creditsAdded: pkg.credits,
      status: 'completed',
      processedAt: FieldValue.serverTimestamp(),
    });

    console.log(`[Webhook] Done — ${packageType} for ${userId}`);

    return NextResponse.json({
      success: true,
      userId,
      packageType,
      creditsAdded: pkg.credits,
    });

  } catch (e: any) {
    console.error('[Webhook] Error:', e);

    try {
      const adminDb = getAdminDb();
      await adminDb.collection('errors').add({
        source: 'square-webhook',
        message: String(e),
        stack: e?.stack || null,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (logErr) {
      console.error('[Webhook] Failed to log error:', logErr);
    }

    return NextResponse.json({ error: 'Failed', details: String(e) }, { status: 500 });
  }
}
