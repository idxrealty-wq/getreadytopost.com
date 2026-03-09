import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

function initAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const { password } = await req.json();
    if (password !== "GRTP2026GeoCodeExpert") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const snap = await db.collection("listings").orderBy("createdAt", "desc").get();
    const listings: any[] = [];
    snap.forEach((doc) => {
      const d = doc.data();
      listings.push({
        id: doc.id,
        address: d.address || '',
        createdAt: d.createdAt || '',
        updatedAt: d.updatedAt || '',
        userId: d.userId || '',
        ownerName: d.propertyData?.ownerName || '',
        yearBuilt: d.propertyData?.yearBuilt || '',
        beds: d.propertyData?.beds || '',
        baths: d.propertyData?.baths || '',
        sqft: d.propertyData?.sqft || '',
        propertyType: d.propertyData?.propertyType || '',
        annualTax: d.propertyData?.annualTax || '',
        assessedValue: d.propertyData?.assessedValue || '',
        flood_zone: d.propertyData?.flood_zone || '',
        homestead: d.propertyData?.homestead || '',
        aiListing: d.aiListing ? '✅' : '❌',
        fieldCount: Object.keys(d.propertyData || {}).filter(k => d.propertyData[k]).length,
      });
    });
    return NextResponse.json({ listings, total: listings.length });
  } catch (err: any) {
    console.error("Admin listings error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
