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

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();

    if (!body.businessName || !body.businessName.trim()) {
      return NextResponse.json({ error: "Business Name is required" }, { status: 400 });
    }

    const vendorData = {
      businessName: body.businessName?.trim() || "",
      contactName: body.contactName?.trim() || "",
      email: body.email?.trim()?.toLowerCase() || "",
      phone: body.phone?.trim() || "",
      websiteUrl: body.websiteUrl?.trim() || "",
      categoryId: body.categoryId || "",
      tier: body.tier || "local",
      marketId: body.marketId || "",
      logoUrl: body.logoUrl?.trim() || "",
      adGraphicUrl: body.adGraphicUrl?.trim() || "",
      ctaText: body.ctaText?.trim() || "",
      destinationUrl: body.destinationUrl?.trim() || "",
      shortDescription: body.shortDescription?.trim() || "",
      description: body.description?.trim() || "",
      status: body.status || "pending",
      notes: body.notes?.trim() || "",
      address: body.address?.trim() || "",
      city: body.city?.trim() || "",
      state: body.state?.trim() || "",
      zip: body.zip?.trim() || "",
      areasServed: Array.isArray(body.areasServed) ? body.areasServed : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      nowServing: Array.isArray(body.nowServing) ? body.nowServing : [],
      videoUrl: body.videoUrl?.trim() || "",
      videoTier: body.videoTier || "none",
      videoLanguages: Array.isArray(body.videoLanguages) ? body.videoLanguages : [],
      vaultUrl: body.vaultUrl?.trim() || "",
      isParent: Boolean(body.isParent),
      isVerified: Boolean(body.isVerified),
      verificationStatus: body.verificationStatus || "not_verified",
      verifiedDate: body.verifiedDate ? new Date(body.verifiedDate) : null,
      verificationNotes: body.verificationNotes?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("vendors").add(vendorData);

    const doc = await docRef.get();
    const d = doc.data();
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
      description: d?.description || "",
      status: d?.status || "pending",
      notes: d?.notes || "",
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
      vaultUrl: d?.vaultUrl || "",
      isParent: Boolean(d?.isParent),
      isVerified: Boolean(d?.isVerified),
      verificationStatus: d?.verificationStatus || "not_verified",
      verifiedDate: d?.verifiedDate?.toDate?.()?.toISOString?.() || d?.verifiedDate || null,
      verificationNotes: d?.verificationNotes || "",
      createdAt: d?.createdAt?.toDate?.()?.toISOString?.() || d?.createdAt || "",
      updatedAt: d?.updatedAt?.toDate?.()?.toISOString?.() || d?.updatedAt || "",
    };

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (err: any) {
    console.error("Vendor CREATE error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
