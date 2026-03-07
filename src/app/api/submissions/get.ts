import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var not set");

  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export async function GET(req: NextRequest) {
  try {
    const submissionId = req.nextUrl.searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submission id" }, { status: 400 });
    }

    const snap = await db.collection("submissions").doc(submissionId).get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json(snap.data(), { status: 200 });
  } catch (error) {
    console.error("GET /api/submissions/get error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
