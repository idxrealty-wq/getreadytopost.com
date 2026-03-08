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

function extractStoragePathFromFirebaseDownloadUrl(downloadURL: string): string {
  const url = new URL(downloadURL);
  const marker = "/o/";
  const idx = url.pathname.indexOf(marker);
  if (idx === -1) return "";
  const encodedPath = url.pathname.substring(idx + marker.length);
  return decodeURIComponent(encodedPath);
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = admin.firestore();
    const storage = admin.storage();

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

    // Validate access code against listing
    const listingRef = db.collection("listings").doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const listingData = listingDoc.data() || {};
    const storedCode = String(listingData.documentAccessCode || "").trim();

    if (!storedCode) {
      return NextResponse.json(
        { error: "No access code set for this listing" },
        { status: 403 }
      );
    }

    if (storedCode !== accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
    }

    // Find doc
    const docs = Array.isArray(listingData.documents) ? listingData.documents : [];
    const doc = docs.find((d: any) => String(d?.docId || "") === docId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.sharedWithBuyer === false) {
      return NextResponse.json({ error: "Document not shared" }, { status: 403 });
    }

    const downloadURL = String(doc.downloadURL || "").trim();
    if (!downloadURL) {
      return NextResponse.json({ error: "Document has no download URL" }, { status: 500 });
    }

    let filePath = "";
    try {
      filePath = extractStoragePathFromFirebaseDownloadUrl(downloadURL);
    } catch (e) {
      console.error("[documents/preview] URL parse error:", e);
      return NextResponse.json({ error: "Invalid document URL" }, { status: 500 });
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "Could not extract file path from document URL" },
        { status: 500 }
      );
    }

    // Generate a short-lived signed URL for preview (30 minutes)
    const bucket = storage.bucket();
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    });

    return NextResponse.json({
      success: true,
      previewUrl: signedUrl,
      fileName: String(doc.fileName || "document"),
    });
  } catch (e: any) {
    console.error("[documents/preview] error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
