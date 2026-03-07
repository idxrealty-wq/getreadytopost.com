import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length > 0) return;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

  const sa: any = JSON.parse(json);
  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  initializeApp({ credential: cert(sa) });
}

export async function GET(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");
    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const snap = await db.collection("submissions").doc(submissionId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_found", submissionId }, { status: 404 });
    }

    return NextResponse.json({ ok: true, submissionId, data: snap.data() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown_error" }, { status: 500 });
  }
}
