import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length > 0) return;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

  const sa: any = JSON.parse(json);

  if (!sa.private_key || typeof sa.private_key !== "string") {
    throw new Error('Service account object must contain a string "private_key" property.');
  }

  sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  initializeApp({ credential: cert(sa) });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();

    const listingDescription = body?.listingDescription;
    const email = body?.email;

    if (
      !listingDescription ||
      !String(listingDescription).trim() ||
      !email ||
      !String(email).trim()
    ) {
      return NextResponse.json(
        { error: "listingDescription and email are required" },
        { status: 400 }
      );
    }

    const submission = {
      listingText: String(listingDescription),
      email: String(email),

      // IMPORTANT: store uid if provided (Rate My Listing can send null for now)
      uid: body?.uid ?? null,

      propertyDetails: {
        address: body?.address || "",
        city: body?.city || "",
        state: body?.state || "",
        zip: body?.zip || "",
        beds: body?.beds ?? null,
        baths: body?.baths ?? null,
        sqft: body?.sqft ?? null,
        yearBuilt: body?.yearBuilt ?? null,
        price: body?.price ?? null,
        hoa: body?.hoa === "yes",
        hoaAmount: body?.hoaAmount ?? null,
      },

      nearby: body?.nearby ?? null,
      status: "created",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("submissions").add(submission);
    return NextResponse.json({ submissionId: docRef.id, ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Create failed", message: String(e?.message || e) },
      { status: 500 }
    );
  }
}
