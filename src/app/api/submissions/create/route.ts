import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (getApps().length > 0) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");
  let sa: any;
  try {
    sa = JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e}`);
  }
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
    const {
      listingDescription,
      email,
      address,
      city,
      state,
      zip,
      beds,
      baths,
      sqft,
      yearBuilt,
      price,
      hoa,
      hoaAmount,
    } = body;

    if (!listingDescription?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "listingDescription and email are required" },
        { status: 400 }
      );
    }

    const submission = {
      listingText: listingDescription,
      email,
      propertyDetails: {
        address: address || "",
        city: city || "",
        state: state || "",
        zip: zip || "",
        beds: beds ? parseInt(String(beds)) : null,
        baths: baths ? parseFloat(String(baths)) : null,
        sqft: sqft ? parseInt(String(sqft)) : null,
        yearBuilt: yearBuilt ? parseInt(String(yearBuilt)) : null,
        price: price ? parseInt(String(price).replace(/,/g, "")) : null,
        hoa: hoa === "yes",
        hoaAmount: hoaAmount ? parseFloat(String(hoaAmount).replace(/,/g, "")) : null,
      },
      status: "created",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("submissions").add(submission);

    return NextResponse.json({ submissionId: docRef.id, ok: true });
  } catch (e: any) {
    console.error("[create] Error:", e?.message);
    console.error("[create] Stack:", e?.stack);
    return NextResponse.json({ error: `Create failed: ${e?.message}` }, { status: 500 });
  }
}
