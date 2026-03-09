import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { logError } from "@/lib/logError";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");
  const sa: any = JSON.parse(json);
  if (!sa.private_key || typeof sa.private_key !== "string") {
    throw new Error('Service account object must contain a string "private_key" property.');
  }
  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  initializeApp({ credential: cert(sa) });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();
    const listingText = String(body?.listingText || body?.listingDescription || "").trim();
    const email = String(body?.email || "").trim();
    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    const submission = {
      listingText,
      email,
      uid: body?.uid ?? null,
      address: String(body?.address || "").trim(),
      propertyDetails: body?.propertyDetails || {},
      nearby: body?.nearby ?? null,
      status: "created",
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("submissions").add(submission);
    return NextResponse.json({ submissionId: docRef.id, ok: true });
  } catch (e: any) {
    console.error("[submissions/create] Error:", e?.message);
    await logError({ source: "submissions-create", error: e, context: {} });
    return NextResponse.json(
      { error: "Create failed", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
