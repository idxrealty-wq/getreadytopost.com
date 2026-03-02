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
  const { listingId } = await req.json();
  const snap = await db.collection("listings").doc(listingId).get();
  const data = snap.data() || {};
  return NextResponse.json({ documents: data.documents || [] });
}
