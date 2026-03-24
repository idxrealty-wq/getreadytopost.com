import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (!getApps().length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const sa: any = JSON.parse(json);
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      initializeApp({ credential: cert(sa) });
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
  }
}

export async function GET() {
  try {
    initAdmin();
    const db = getFirestore();
    const snap = await db.collection("roofing_comments").orderBy("createdAt", "desc").limit(50).get();
    const comments: any[] = [];
    snap.forEach(doc => {
      const d = doc.data();
      comments.push({ id: doc.id, name: d.name || "Anonymous", location: d.location || "", message: d.message || "", createdAt: d.createdAt?.toDate?.()?.toISOString?.() || "" });
    });
    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();
    const { name, location, message } = body;
    if (!message || message.trim().length < 3) return NextResponse.json({ error: "Message too short" }, { status: 400 });
    const doc = await db.collection("roofing_comments").add({ name: name?.trim() || "Anonymous", location: location?.trim() || "", message: message.trim(), createdAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ id: doc.id, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
