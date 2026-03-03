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
  const ref = db.collection("listings").doc(listingId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });
  const data = snap.data() || {};
  const updated = (data.documents || []).map((d: any) => ({
    ...d,
    sharedWithBuyer: d.sharedWithBuyer !== undefined ? d.sharedWithBuyer : true,
  }));
  await ref.update({ documents: updated });
  return NextResponse.json({ success: true, count: updated.length });
}
