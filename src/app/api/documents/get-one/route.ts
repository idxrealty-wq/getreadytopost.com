import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");

  const sa = JSON.parse(raw);
  if (typeof sa.private_key === "string") {
    sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = admin.firestore();

    const body = await req.json().catch(() => ({}));
    const listingId = String(body?.listingId || "").trim();
    const docId = String(body?.docId || "").trim();
    const accessCode = String(body?.accessCode || "").trim();

    if (!listingId || !docId || !accessCode) {
      return NextResponse.json(
        { error: "listingId, docId, and accessCode are required" },
        { status: 400 }
      );
    }

    const listingRef = db.collection("listings").doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const data = listingDoc.data() || {};
    const storedCode = String(data.documentAccessCode || "").trim();

    if (!storedCode) {
      return NextResponse.json(
        { error: "No access code set for this listing" },
        { status: 403 }
      );
    }

    if (storedCode !== accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
    }

    const docs = Array.isArray(data.documents) ? data.documents : [];
    const doc = docs.find((d: any) => String(d?.docId || "") === docId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.sharedWithBuyer === false) {
      return NextResponse.json({ error: "Document not shared" }, { status: 403 });
    }

    // NOTE: For now we still return downloadURL so the browser can render it.
    // Next hardening step: proxy file download/preview through a signed endpoint
    // so the raw storage URL is never exposed.
    return NextResponse.json({
      success: true,
      address: String(data.address || ""),
      document: {
        docId: String(doc.docId || ""),
        label: String(doc.label || ""),
        fileName: String(doc.fileName || ""),
        fileType: String(doc.fileType || ""),
        downloadURL: String(doc.downloadURL || ""),
      },
    });
  } catch (e: any) {
    console.error("[documents/get-one] error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
