import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

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

export async function GET(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");
    const categoryId = searchParams.get("categoryId");
    const marketId = searchParams.get("marketId");

    let ref: any = db.collection("vendors");

    if (status) ref = ref.where("status", "==", status);
    if (tier) ref = ref.where("tier", "==", tier);
    if (categoryId) ref = ref.where("categoryId", "==", categoryId);
    if (marketId) ref = ref.where("marketId", "==", marketId);

    ref = ref.orderBy("createdAt", "desc");

    const snap = await ref.get();

    const vendors: any[] = [];
    snap.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const d = doc.data();
      vendors.push({
        id: doc.id,
        businessName: d.businessName || "",
        contactName: d.contactName || "",
        email: d.email || "",
        phone: d.phone || "",
        websiteUrl: d.websiteUrl || "",
        categoryId: d.categoryId || "",
        tier: d.tier || "",
        marketId: d.marketId || "",
        logoUrl: d.logoUrl || "",
        adGraphicUrl: d.adGraphicUrl || "",
        ctaText: d.ctaText || "",
        destinationUrl: d.destinationUrl || "",
        shortDescription: d.shortDescription || "",
        status: d.status || "pending",
        notes: d.notes || "",
        isVerified: d.isVerified || false,
        verifiedDate: d.verifiedDate?.toDate?.()?.toISOString?.() || d.verifiedDate || "",
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || "",
        updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt || "",
      });
    });

    return NextResponse.json({ vendors });
  } catch (err: any) {
    console.error("Vendors API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
