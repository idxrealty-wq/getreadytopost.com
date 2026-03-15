import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { checkoutId, tier } = await req.json();

    if (!checkoutId) {
      return NextResponse.json(
        { success: false, message: 'Checkout ID is required' },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();

    // Query all users' transactions to find the one with this checkoutId
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

    if (!foundTransaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found. Payment may still be processing.' },
        { status: 404 }
      );
    }

    // Return transaction details
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
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
