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
    const snapshot = await db
      .collection("vendors")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const vendors = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        businessName: data.businessName || "",
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || "",
      };
    });

    return NextResponse.json({ vendors });
  } catch (err: any) {
    console.error("Recent vendors error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
