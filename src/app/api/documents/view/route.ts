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
    const { listingId, accessCode } = await req.json();
    if (!listingId || !accessCode) {
      return NextResponse.json({ error: "Listing ID and access code are required" }, { status: 400 });
    }
    const listingRef = db.collection("listings").doc(listingId);
    const listingDoc = await listingRef.get();
    if (!listingDoc.exists) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    const data = listingDoc.data() || {};
    if (!data.documentAccessCode) {
      return NextResponse.json({ error: "No access code set for this listing" }, { status: 403 });
    }
    if (data.documentAccessCode !== accessCode) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 403 });
    }
    const documents = (data.documents || [])
      .filter((doc: any) => doc.sharedWithBuyer !== false)
      .map((doc: any) => ({
        docId: doc.docId,
        label: doc.label,
        fileName: doc.fileName,
        fileType: doc.fileType,
        downloadURL: doc.downloadURL,
      }));
    return NextResponse.json({
      success: true,
      address: data.address || "",
      documents,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
