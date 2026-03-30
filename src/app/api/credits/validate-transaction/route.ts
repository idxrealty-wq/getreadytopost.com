import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
export async function GET(req: NextRequest) {
  return POST(req);
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

    const squarePaymentId = searchParams.get('transactionId') || body.transactionId;
    const squareOrderId = searchParams.get('orderId') || body.orderId;

    if (!squarePaymentId && !squareOrderId) {
      return NextResponse.json(
        { success: false, message: 'transactionId or orderId is required' },
        { status: 400 }
      );
    }

    console.log(`[Validate] Searching — squarePaymentId=${squarePaymentId} squareOrderId=${squareOrderId}`);

    const adminDb = getAdminDb();

    // ─── SEARCH 1: webhook_processed by squarePaymentId ──────────────────
    // This is the fastest check — if webhook fired, this doc exists
    if (squarePaymentId) {
      const processedSnap = await adminDb
        .collection('webhook_processed')
        .doc(squarePaymentId)
        .get();

      if (processedSnap.exists) {
        const processed = processedSnap.data()!;

        if (processed.status === 'completed' && processed.userId) {
          console.log(`[Validate] Found in webhook_processed — userId=${processed.userId}`);

          // Fetch the actual transaction record for full details
          const txSnap = await adminDb
            .collection('users')
            .doc(processed.userId)
            .collection('transactions')
            .where('squarePaymentId', '==', squarePaymentId)
            .limit(1)
            .get();

          if (!txSnap.empty) {
            const tx = txSnap.docs[0].data();
            return NextResponse.json({
              success: true,
              transaction: {
                squarePaymentId,
                squareOrderId: tx.squareOrderId || squareOrderId,
                amount: Math.round(tx.revenue * 100),
                credits: tx.creditsAdded,
                packageType: tx.packageType,
                status: 'completed',
                userId: processed.userId,
                createdAt: tx.timestamp,
              },
            });
          }

          // webhook_processed exists but transaction not written yet — still processing
          if (processed.status === 'processing') {
            return NextResponse.json(
              { success: false, message: 'Payment is being processed' },
              { status: 404 }
            );
          }
        }

        if (processed.status === 'failed') {
          return NextResponse.json(
            { success: false, message: 'Payment processing failed. Please contact support.' },
            { status: 404 }
          );
        }
      }
    }

    // ─── SEARCH 2: transactions by squarePaymentId ────────────────────────
    if (squarePaymentId) {
      const usersSnap = await adminDb.collection('users').get();
      for (const userDoc of usersSnap.docs) {
        const txSnap = await userDoc.ref
          .collection('transactions')
          .where('squarePaymentId', '==', squarePaymentId)
          .limit(1)
          .get();

        if (!txSnap.empty) {
          const tx = txSnap.docs[0].data();
          console.log(`[Validate] Found by squarePaymentId — userId=${userDoc.id}`);
          return NextResponse.json({
            success: true,
            transaction: {
              squarePaymentId,
              squareOrderId: tx.squareOrderId || squareOrderId,
              amount: Math.round(tx.revenue * 100),
              credits: tx.creditsAdded,
              packageType: tx.packageType,
              status: 'completed',
              userId: userDoc.id,
              createdAt: tx.timestamp,
            },
          });
        }
      }
    }

    // ─── SEARCH 3: transactions by squareOrderId ──────────────────────────
    if (squareOrderId) {
      const usersSnap = await adminDb.collection('users').get();
      for (const userDoc of usersSnap.docs) {
        const txSnap = await userDoc.ref
          .collection('transactions')
          .where('squareOrderId', '==', squareOrderId)
          .limit(1)
          .get();

        if (!txSnap.empty) {
          const tx = txSnap.docs[0].data();
          console.log(`[Validate] Found by squareOrderId — userId=${userDoc.id}`);
          return NextResponse.json({
            success: true,
            transaction: {
              squarePaymentId: tx.squarePaymentId || squarePaymentId,
              squareOrderId,
              amount: Math.round(tx.revenue * 100),
              credits: tx.creditsAdded,
              packageType: tx.packageType,
              status: 'completed',
              userId: userDoc.id,
              createdAt: tx.timestamp,
            },
          });
        }
      }
    }

    // ─── NOT FOUND ────────────────────────────────────────────────────────
    console.log(`[Validate] Not found — squarePaymentId=${squarePaymentId} squareOrderId=${squareOrderId}`);
    return NextResponse.json(
      { success: false, message: 'Transaction not found. Payment may still be processing.' },
      { status: 404 }
    );

  } catch (error) {
    console.error('[Validate] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
