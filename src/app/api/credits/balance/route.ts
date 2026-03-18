import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length > 0) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin env vars missing (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY)");
  }
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}
export async function GET(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const ref = db.collection("users").doc(userId).collection("credits").doc("balance");
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ userId, balance: 0 }, { status: 200 });
    }

    const data = snap.data() || {};
    const balance = Number((data as any).balance ?? (data as any).credits ?? (data as any).creditBalance ?? 0);

    return NextResponse.json({ userId, balance }, { status: 200 });
  } catch (e: any) {
    console.error("Balance error:", e?.message || e);
    return NextResponse.json(
      { error: `Balance: ${e?.message || String(e)}` },
      { status: 500 }
    );
  }
}
