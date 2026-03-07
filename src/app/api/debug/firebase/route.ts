import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length) return;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "";
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing FIREBASE_ADMIN_* env vars");
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
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
        {
          ok: false,
          error: "Provide userId=... or email=...",
        },
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
