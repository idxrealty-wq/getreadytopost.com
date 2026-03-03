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
  const { secret } = await req.json();
  if (secret !== "grtp-cleanup-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snap = await db.collection("listings").get();
  const toDelete: string[] = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (!data.address || data.address.trim() === "") {
      toDelete.push(doc.id);
    }
  });
  const batch = db.batch();
  toDelete.forEach((id) => batch.delete(db.collection("listings").doc(id)));
  await batch.commit();
  return NextResponse.json({ success: true, deleted: toDelete.length });
}
