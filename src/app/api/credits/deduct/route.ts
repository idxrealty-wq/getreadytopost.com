import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length) return;

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

async function resolveUserDocId(db: any, userIdOrEmail: string): Promise<string | null> {
  const raw = String(userIdOrEmail || "").trim();
  if (!raw) return null;

  // If it looks like an email, try to find the user doc by email field
  if (raw.includes("@")) {
    const qs = await db
      .collection("users")
      .where("email", "==", raw.toLowerCase())
      .limit(1)
      .get();

    if (qs.empty) return null;
    return qs.docs[0].id;
  }

  // Otherwise assume it's already a user doc id (uid)
  return raw;
}

export async function POST(req: NextRequest) {
  initAdmin();
  const db = getFirestore();

  try {
    const { userId, submissionId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const resolvedUserDocId = await resolveUserDocId(db, String(userId));
    if (!resolvedUserDocId) {
      return NextResponse.json(
        { error: "User not found for provided userId/email" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(resolvedUserDocId);
    const balanceRef = userRef.collection("credits").doc("balance");
    const submissionRef = submissionId
      ? db.collection("submissions").doc(String(submissionId))
      : null;

    const result = await db.runTransaction(async (tx: any) => {
      // If submission already marked as used, do nothing (idempotent)
      if (submissionRef) {
        const subSnap = await tx.get(submissionRef);
        if (subSnap.exists) {
          const sub = subSnap.data() || {};
          if (sub.creditUsed === true) {
            const balSnap = await tx.get(balanceRef);
            const bal = balSnap.exists ? Number(balSnap.data()?.balance || 0) : 0;
            return { alreadyUsed: true, newBalance: bal };
          }
        }
      }

      const balSnap = await tx.get(balanceRef);
      const currentBalance = balSnap.exists ? Number(balSnap.data()?.balance || 0) : 0;

      if (currentBalance <= 0) {
        throw new Error("Insufficient credits");
      }

      const newBalance = currentBalance - 1;

      // Use set(merge) so it works even if the doc doesn't exist yet
      tx.set(balanceRef, { balance: newBalance }, { merge: true });

      if (submissionRef) {
        tx.set(
          submissionRef,
          {
            creditUsed: true,
            creditDeductedAt: new Date().toISOString(),
            creditUserId: resolvedUserDocId,
          },
          { merge: true }
        );
      }

      const txnRef = userRef.collection("transactions").doc();
      tx.set(txnRef, {
        type: "deduct",
        amount: -1,
        newBalance,
        submissionId: submissionId || null,
        timestamp: new Date().toISOString(),
      });

      return { alreadyUsed: false, newBalance };
    });

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      alreadyUsed: result.alreadyUsed,
      resolvedUserId: resolvedUserDocId,
    });
  } catch (error: any) {
    const msg = String(error?.message || error || "Server error");

    // Make insufficient credits a 400 (expected failure), not 500
    if (msg.toLowerCase().includes("insufficient credits")) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    console.error("Deduct credit error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
