import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "";
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "";
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

    if (!getApps().length) {
      initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
});
    }

    const db = getFirestore();
    const snap = await db.collection("users").doc(userId).get();

    return NextResponse.json({
      projectId,
      clientEmailSuffix: clientEmail.slice(-20),
      userDocExists: snap.exists,
      balance: snap.exists ? (snap.data() as any)?.credits?.balance ?? null : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
