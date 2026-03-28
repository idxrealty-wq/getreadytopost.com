import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const CREDIT_PACKAGES: Record<string, any> = {
  credit: { creditsToAdd: 1, revenue: 1.5, type: 'one-time' },
  test: { creditsToAdd: 1, revenue: 1.5, type: 'one-time' },
  single: { creditsToAdd: 1, revenue: 19.99, type: 'one-time' },
  '5pack': { creditsToAdd: 5, revenue: 85.0, type: 'one-time' },
  monthly: { creditsToAdd: 30, revenue: 30.0, type: 'subscription', billingCycle: 'monthly' },
  'semi-annual': { creditsToAdd: 300, revenue: 495.0, type: 'subscription', billingCycle: 'semi-annual' },
  annual: { creditsToAdd: 450, revenue: 899.0, type: 'subscription', billingCycle: 'annual' },
  'elite-annual': { creditsToAdd: 899, revenue: 999.0, type: 'subscription', billingCycle: 'annual' },
};

function getRenewalDate(billingCycle: 'monthly' | 'semi-annual' | 'annual') {
  const renewalDate = new Date();
  if (billingCycle === 'monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else if (billingCycle === 'semi-annual') {
    renewalDate.setMonth(renewalDate.getMonth() + 6);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  return renewalDate;
}

function getPropertyPullPrice(tier: string): number {
  if (tier === 'monthly') return 3;
  if (tier === 'semi-annual') return 2.5;
  if (tier === 'elite-annual') return 1.0;
  return 1.75;
}

export async function POST(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const checkoutId = searchParams.get('checkoutId') || body.checkoutId;
    const transactionId = searchParams.get('transactionId') || body.transactionId;
    const tier = searchParams.get('tier') || body.tier;
    const userIdFromRequest = searchParams.get('userId') || body.userId;

    if (!checkoutId && !transactionId) {
      return NextResponse.json(
        { success: false, message: 'Checkout ID or Transaction ID is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const usersRef = adminDb.collection('users');
    const usersSnap = await usersRef.get();
    let foundTransaction: any = null;
    let userId: string | null = null;

    for (const userDoc of usersSnap.docs) {
      const transactionsRef = userDoc.ref.collection('transactions');

      // Search 1: by transactionId field
      if (transactionId) {
        const snap1 = await transactionsRef.where('transactionId', '==', transactionId).get();
        if (!snap1.empty) {
          foundTransaction = snap1.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }

      // Search 2: by squareOrderId field (written by webhook)
      if (!foundTransaction && transactionId) {
        const snap2 = await transactionsRef.where('squareOrderId', '==', transactionId).get();
        if (!snap2.empty) {
          foundTransaction = snap2.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }

      // Search 3: by orderId field matching checkoutId
      if (!foundTransaction && checkoutId) {
        const snap3 = await transactionsRef.where('orderId', '==', checkoutId).get();
        if (!snap3.empty) {
          foundTransaction = snap3.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }

      // Search 4: by squareOrderId field matching checkoutId
      if (!foundTransaction && checkoutId) {
        const snap4 = await transactionsRef.where('squareOrderId', '==', checkoutId).get();
        if (!snap4.empty) {
          foundTransaction = snap4.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }

      // Search 5: by paymentId field
      if (!foundTransaction && transactionId) {
        const snap5 = await transactionsRef.where('paymentId', '==', transactionId).get();
        if (!snap5.empty) {
          foundTransaction = snap5.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }
    }

    // FOUND — return existing transaction, do not write anything
    if (foundTransaction && userId) {
      console.log(`[Validate] Found existing transaction for user ${userId}`);
      return NextResponse.json({
        success: true,
        transaction: {
          checkoutId: foundTransaction.orderId || checkoutId || transactionId,
          transactionId: foundTransaction.transactionId || transactionId || foundTransaction.orderId,
          amount: Math.round(foundTransaction.revenue * 100),
          credits: foundTransaction.creditsAdded,
          packageType: foundTransaction.packageType,
          status: 'completed',
          userId,
          createdAt: foundTransaction.timestamp,
        },
      });
    }

    // NOT FOUND — fallback fulfillment only if userId and tier are present
    if (!userIdFromRequest || !tier || !(tier in CREDIT_PACKAGES)) {
      console.warn(`[Validate] Transaction not found. checkoutId=${checkoutId} transactionId=${transactionId}`);
      return NextResponse.json(
        { success: false, message: 'Transaction not found. Payment may still be processing.' },
        { status: 404 }
      );
    }

    const userIdSafe = userIdFromRequest;
    const pkg = CREDIT_PACKAGES[tier];
    const userRef = adminDb.collection('users').doc(userIdSafe);
    const userCreditsRef = userRef.collection('credits').doc('balance');

    if (pkg.creditsToAdd > 0) {
      await userCreditsRef.set(
        {
          balance: FieldValue.increment(pkg.creditsToAdd),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (pkg.type === 'subscription') {
      const billingCycle = pkg.billingCycle || 'annual';
      const renewalDate = getRenewalDate(billingCycle);

      await userRef.set(
        {
          subscription: {
            planId: tier,
            status: 'active',
            creditsPerCycle: pkg.creditsToAdd,
            propertyPullPrice: getPropertyPullPrice(tier),
            vaultAccess: true,
            workspaceAccess: true,
            billingCycle,
            renewalDate,
            lastPaymentDate: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    }

    const transactionsRef = userRef.collection('transactions');
    await transactionsRef.add({
      type: 'purchase',
      packageType: tier,
      creditsAdded: pkg.creditsToAdd,
      revenue: pkg.revenue,
      orderId: checkoutId || transactionId,
      paymentId: transactionId || checkoutId,
      transactionId: transactionId || checkoutId,
      subscriptionApplied: pkg.type === 'subscription',
      timestamp: FieldValue.serverTimestamp(),
      source: 'success-page-validation',
    });

    console.log(`[Validate] Fallback fulfilled ${tier} for user ${userIdSafe}`);

    return NextResponse.json({
      success: true,
      transaction: {
        checkoutId: checkoutId || transactionId,
        transactionId: transactionId || checkoutId,
        amount: Math.round(pkg.revenue * 100),
        credits: pkg.creditsToAdd,
        packageType: tier,
        status: 'completed',
        userId: userIdSafe,
        createdAt: new Date().toISOString(),
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
