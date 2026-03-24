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

function mapVendor(id: string, d: any) {
  return {
    id,
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
    videoTier: d?.videoTier || "",
    videoLanguages: d?.videoLanguages || [],
    vaultUrl: d?.vaultUrl || "",
    isParent: d?.isParent || false,
    locations: d?.locations || [],
    isVerified: d?.isVerified || false,
    verificationStatus: d?.verificationStatus || "not_verified",
    verifiedDate: d?.verifiedDate || "",
    verificationNotes: d?.verificationNotes || "",
    createdAt: d?.createdAt?.toDate?.()?.toISOString?.() || d?.createdAt || "",
    updatedAt: d?.updatedAt?.toDate?.()?.toISOString?.() || d?.updatedAt || "",
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    initAdmin();
    const db = getFirestore();
    const doc = await db.collection("vendors").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    return NextResponse.json({ vendor: mapVendor(doc.id, doc.data()) });
  } catch (err: any) {
    console.error("Vendor GET error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    initAdmin();
    const db = getFirestore();
    const body = await req.json();

    const updateData = {
      businessName: body.businessName || "",
      contactName: body.contactName || "",
      email: body.email || "",
      phone: body.phone || "",
      websiteUrl: body.websiteUrl || "",
      categoryId: body.categoryId || "",
      tier: body.tier || "local",
      marketId: body.marketId || "",
      logoUrl: body.logoUrl || "",
      adGraphicUrl: body.adGraphicUrl || "",
      ctaText: body.ctaText || "",
      destinationUrl: body.destinationUrl || "",
      shortDescription: body.shortDescription || "",
      status: body.status || "pending",
      notes: body.notes || "",
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      zip: body.zip || "",
      areasServed: Array.isArray(body.areasServed) ? body.areasServed : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      nowServing: Array.isArray(body.nowServing) ? body.nowServing : [],
      videoUrl: body.videoUrl || "",
      videoTier: body.videoTier || "",
      videoLanguages: Array.isArray(body.videoLanguages) ? body.videoLanguages : [],
      vaultUrl: body.vaultUrl || "",
      isParent: body.isParent || false,
      locations: Array.isArray(body.locations) ? body.locations : [],
      isVerified: body.isVerified || false,
      verificationStatus: body.verificationStatus || "not_verified",
      verifiedDate: body.verifiedDate || "",
      verificationNotes: body.verificationNotes || "",
      updatedAt: new Date(),
    };

    await db.collection("vendors").doc(params.id).update(updateData);
    const doc = await db.collection("vendors").doc(params.id).get();
    return NextResponse.json({ vendor: mapVendor(doc.id, doc.data()) });
  } catch (err: any) {
    console.error("Vendor PUT error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    initAdmin();
    const db = getFirestore();
    await db.collection("vendors").doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Vendor DELETE error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
