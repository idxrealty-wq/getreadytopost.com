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
    const tier = searchParams.get('tier') || body.tier;
    const userIdFromRequest = searchParams.get('userId') || body.userId;

    if (!checkoutId) {
      return NextResponse.json(
        { success: false, message: 'Checkout ID is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // First, try to find existing transaction
    const usersRef = adminDb.collection('users');
    const usersSnap = await usersRef.get();
    let foundTransaction: any = null;
    let userId: string | null = null;

    for (const userDoc of usersSnap.docs) {
      const transactionsRef = userDoc.ref.collection('transactions');
      const q = transactionsRef.where('orderId', '==', checkoutId);
      const snapshot = await q.get();
      if (!snapshot.empty) {
        foundTransaction = snapshot.docs[0].data();
        userId = userDoc.id;
        break;
      }
    }

    // If transaction found, return it
    if (foundTransaction && userId) {
      return NextResponse.json({
        success: true,
        transaction: {
          checkoutId: foundTransaction.orderId,
          amount: Math.round(foundTransaction.revenue * 100),
          credits: foundTransaction.creditsAdded,
          packageType: foundTransaction.packageType,
          status: 'completed',
          userId,
          createdAt: foundTransaction.timestamp,
        },
      });
    }

    // Fallback fulfillment if webhook did not create the transaction yet
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

    // Add credits
    if (pkg.creditsToAdd > 0) {
      await userCreditsRef.set(
        {
          balance: FieldValue.increment(pkg.creditsToAdd),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Add subscription if applicable
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

    // Create transaction record
    const transactionsRef = userRef.collection('transactions');
    await transactionsRef.add({
      type: 'purchase',
      packageType: tier,
      creditsAdded: pkg.creditsToAdd,
      revenue: pkg.revenue,
      orderId: checkoutId,
      paymentId: checkoutId,
      subscriptionApplied: pkg.type === 'subscription',
      timestamp: FieldValue.serverTimestamp(),
      source: 'success-page-validation',
    });

    console.log(`[Validate] Fulfilled ${tier} for user ${userIdSafe} via success page`);

    return NextResponse.json({
      success: true,
      transaction: {
        checkoutId,
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
