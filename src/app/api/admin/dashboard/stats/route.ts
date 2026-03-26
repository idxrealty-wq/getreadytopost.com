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

export async function GET(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const snapshot = await db.collection("vendors").get();
    const vendors = snapshot.docs.map((d) => d.data());

    const totalVendors = vendors.length;
    const pendingVendors = vendors.filter((v) => v.status === "pending").length;
    const approvedVendors = vendors.filter((v) => v.status === "approved").length;
    const verifiedVendors = vendors.filter((v) => v.isVerified === true).length;
    const totalCategories = new Set(vendors.map((v) => v.categoryId).filter(Boolean)).size;
    const totalMarkets = new Set(vendors.map((v) => v.marketId).filter(Boolean)).size;

    return NextResponse.json({
      stats: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        verifiedVendors,
        totalCategories,
        totalMarkets,
      },
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
