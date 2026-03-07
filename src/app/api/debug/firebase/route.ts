import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length) return;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

  let sa: any;
  try {
    sa = JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e}`);
  }

  if (!sa.private_key || typeof sa.private_key !== "string") {
    throw new Error('Service account object must contain a string "private_key" property.');
  }

  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  initializeApp({ credential: cert(sa) });
}

export async function GET(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "").trim();
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    let resolvedUserDocId: string | null = null;

    if (userId) {
      resolvedUserDocId = userId;
    } else if (email) {
      const qs = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!qs.empty) resolvedUserDocId = qs.docs[0].id;
    }

    if (!resolvedUserDocId) {
      return NextResponse.json(
        { ok: false, error: "Provide userId=... or email=..." },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(resolvedUserDocId);
    const userSnap = await userRef.get();

    const balanceRef = userRef.collection("credits").doc("balance");
    const balSnap = await balanceRef.get();

    return NextResponse.json({
      ok: true,
      resolvedUserDocId,
      userDocExists: userSnap.exists,
      userEmailField: userSnap.exists ? (userSnap.data() as any)?.email ?? null : null,
      creditsDocExists: balSnap.exists,
      creditsBalance: balSnap.exists ? (balSnap.data() as any)?.balance ?? null : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
