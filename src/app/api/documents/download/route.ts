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

    // Validate access code
    const listingRef = db.collection("listings").doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const data = listingDoc.data() || {};
    const storedCode = String(data.documentAccessCode || "").trim();

    if (!storedCode || storedCode !== accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
    }

    // Find the document
    const docs = Array.isArray(data.documents) ? data.documents : [];
    const doc = docs.find((d: any) => String(d?.docId || "") === docId);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.sharedWithBuyer === false) {
      return NextResponse.json({ error: "Document not shared" }, { status: 403 });
    }

    // Extract bucket path from downloadURL
    // Format: https://firebasestorage.googleapis.com/v0/b/PROJECT.appspot.com/o/PATH?alt=media&token=TOKEN
    const downloadURL = String(doc.downloadURL || "").trim();
    if (!downloadURL) {
      return NextResponse.json({ error: "Document has no download URL" }, { status: 500 });
    }

    // Parse the path from the URL
    let filePath = "";
    try {
      const url = new URL(downloadURL);
      const pathMatch = url.pathname.match(/\/o\/(.+?)($|\?)/);
      if (pathMatch && pathMatch[1]) {
        filePath = decodeURIComponent(pathMatch[1]);
      }
    } catch (e) {
      console.error("[documents/download] URL parse error:", e);
      return NextResponse.json(
        { error: "Invalid document URL" },
        { status: 500 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "Could not extract file path from document URL" },
        { status: 500 }
      );
    }

    // Generate a short-lived signed URL (1 hour expiry)
    try {
      const bucket = storage.bucket();
      const file = bucket.file(filePath);

      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      return NextResponse.json({
        success: true,
        downloadUrl: signedUrl,
        fileName: String(doc.fileName || "document"),
      });
    } catch (e: any) {
      console.error("[documents/download] signed URL error:", e?.message);
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("[documents/download] error:", e?.message);
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
