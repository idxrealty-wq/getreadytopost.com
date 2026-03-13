import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  if (!h.toLowerCase().startsWith("bearer ")) return "";
  return h.slice(7);
}

export async function GET(req: NextRequest) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Firebase ID token
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const db = getAdminDb();

    // Balance
    const balSnap = await db.collection("users").doc(uid).collection("credits").doc("balance").get();
    const balance = balSnap.exists ? Number(balSnap.data()?.balance ?? 0) : 0;

    // Transactions (last 20)
    const txSnap = await db
      .collection("users")
      .doc(uid)
      .collection("transactions")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    const transactions = txSnap.docs.map((d) => {
      const t: any = d.data();
      return {
        id: d.id,
        type: t.type || "",
        packageType: t.packageType || "",
        creditsAdded: Number(t.creditsAdded ?? 0),
        revenue: t.revenue !== undefined && t.revenue !== null && t.revenue !== "" ? Number(t.revenue) : 0,
        source: t.source || "",
        orderId: t.orderId || t.squareOrderId || "",
        paymentId: t.paymentId || t.squarePaymentId || "",
        timestamp: t.timestamp?.toDate?.()?.toISOString() || t.timestamp || "",
      };
    });

    // Listings (last 20) for this user
    const listSnap = await db
      .collection("listings")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const listings = listSnap.docs.map((d) => {
      const l: any = d.data();
      return {
        id: d.id,
        address: l.address || "",
        createdAt: l.createdAt?.toDate?.()?.toISOString() || l.createdAt || "",
        fieldCount: Object.keys(l.propertyData || {}).filter((k) => l.propertyData[k]).length,
        aiListing: !!l.aiListing,
      };
    });

    return NextResponse.json({
      uid,
      balance,
      transactions,
      listings,
    });
  } catch (e: any) {
    console.error("[Agent Backoffice] Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
