import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function readJsonBodySafe(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function getSubmissionIdFromUrl(req: NextRequest) {
  try {
    const url = new URL(req.url);
    return (url.searchParams.get("submissionId") || "").trim();
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  try {
    initAdmin();

    const submissionId = getSubmissionIdFromUrl(req);

    if (!submissionId) {
      return NextResponse.json(
        {
          error: "submissionId is required",
          hint: "Pass ?submissionId=... in the querystring",
        },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const ref = db.collection("submissions").doc(submissionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ submission: { id: snap.id, ...snap.data() } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    initAdmin();

    const body = await readJsonBodySafe(req);
    const submissionId =
      String(body?.submissionId || body?.id || "").trim() || getSubmissionIdFromUrl(req);

    if (!submissionId) {
      return NextResponse.json(
        {
          error: "submissionId is required",
          hint: "Send JSON { submissionId } or pass ?submissionId=... in the querystring",
        },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const ref = db.collection("submissions").doc(submissionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ submission: { id: snap.id, ...snap.data() } });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
