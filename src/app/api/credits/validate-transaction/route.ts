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

      if (transactionId) {
        const q1 = transactionsRef.where('transactionId', '==', transactionId);
        const snapshot1 = await q1.get();
        if (!snapshot1.empty) {
          foundTransaction = snapshot1.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }

      if (!foundTransaction && checkoutId) {
        const q2 = transactionsRef.where('orderId', '==', checkoutId);
        const snapshot2 = await q2.get();
        if (!snapshot2.empty) {
          foundTransaction = snapshot2.docs[0].data();
          userId = userDoc.id;
          break;
        }
      }
    }

    if (foundTransaction && userId) {
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

    if (!userIdFromRequest || !tier || !(tier in CREDIT_PACKAGES)) {
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
            propertyPullPrice:
              tier === 'monthly' ? 3 : tier === 'semi-annual' ? 2.5 : 1.75,
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

    console.log(`[Validate] Fulfilled ${tier} for user ${userIdSafe} via success page`);

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
    console.error('Validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
