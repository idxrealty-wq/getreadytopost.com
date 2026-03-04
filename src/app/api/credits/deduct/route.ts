import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  initAdmin();
  const db = getFirestore();

  try {
    const { userId, submissionId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const balanceRef = db.collection("users").doc(userId).collection("credits").doc("balance");
    const balanceDoc = await balanceRef.get();
    const currentBalance = balanceDoc.exists ? (balanceDoc.data()?.balance || 0) : 0;

    if (currentBalance <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    const newBalance = currentBalance - 1;

    await balanceRef.update({ balance: newBalance });

    if (submissionId) {
      await db.collection("submissions").doc(submissionId).update({
        creditUsed: true,
        creditDeductedAt: new Date().toISOString(),
      });
    }

    await db.collection("users").doc(userId).collection("transactions").add({
      type: "deduct",
      amount: -1,
      newBalance,
      submissionId: submissionId || null,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, newBalance });
  } catch (error: any) {
    console.error("Deduct credit error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
