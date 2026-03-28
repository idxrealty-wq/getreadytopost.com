import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    initAdmin();
    const db = getFirestore();

    const snapshot = await db
      .collection("markets")
      .where("isActive", "==", true)
      .orderBy("name", "asc")
      .get();

    const markets = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name || "",
        type: d.type || "national",
        state: d.state || "",
        region: d.region || "",
        city: d.city || "",
        isActive: Boolean(d.isActive),
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt || "",
        updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt || "",
      };
    });

    return NextResponse.json(markets);
  } catch (err: any) {
    console.error("Vendor markets GET error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
