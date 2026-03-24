import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    initAdmin();
    const db = getFirestore();
    const doc = await db.collection("vendors").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const d = doc.data();

    if (d?.status !== "active" && d?.status !== "approved") {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = {
      id: doc.id,
      businessName: d?.businessName || "",
      contactName: d?.contactName || "",
      email: d?.email || "",
      phone: d?.phone || "",
      websiteUrl: d?.websiteUrl || "",
      categoryId: d?.categoryId || "",
      tier: d?.tier || "local",
      marketId: d?.marketId || "",
      logoUrl: d?.logoUrl || "",
      adGraphicUrl: d?.adGraphicUrl || "",
      ctaText: d?.ctaText || "",
      destinationUrl: d?.destinationUrl || "",
      shortDescription: d?.shortDescription || "",
      address: d?.address || "",
      city: d?.city || "",
      state: d?.state || "",
      zip: d?.zip || "",
      areasServed: d?.areasServed || [],
      tags: d?.tags || [],
      nowServing: d?.nowServing || [],
      videoUrl: d?.videoUrl || "",
      videoTier: d?.videoTier || "none",
      videoLanguages: d?.videoLanguages || [],
      locations: d?.locations || [],
      isParent: d?.isParent || false,
      vaultUrl: d?.vaultUrl || "",
      isVerified: d?.isVerified || false,
      verificationStatus: d?.verificationStatus || "not_verified",
      verifiedDate: d?.verifiedDate || "",
      verificationNotes: d?.verificationNotes || "",
      notVerifiedDate: d?.notVerifiedDate || "",
    };

    return NextResponse.json({ vendor });
  } catch (err: any) {
    console.error("Public vendor GET error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
