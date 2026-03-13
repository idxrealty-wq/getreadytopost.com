import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const PACKAGES: Record<string, { price: number; credits: number }> = {
  test: { price: 1.50, credits: 1 },
  single: { price: 19.99, credits: 1 },
  "5pack": { price: 85.00, credits: 5 },
  monthly: { price: 99.00, credits: 99 },
  "6month": { price: 495.00, credits: 495 },
  annual: { price: 899.00, credits: 899 },
  credits: { price: 1.00, credits: 1 },
};

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
    const { password, query } = await req.json();

    if (password !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // USERS
    const usersSnap = await db.collection("users").get();
    const users: any[] = [];
    let totalRevenue = 0;
    let totalCredits = 0;
    const revenueByPackage: Record<string, { count: number; revenue: number; credits: number }> = {};

    for (const userDoc of usersSnap.docs) {
      const u = userDoc.data();

      // Get transactions subcollection
      const txSnap = await db.collection("users").doc(userDoc.id).collection("transactions").get();
      const transactions: any[] = [];
      let userRevenue = 0;
      let userCredits = 0;

      txSnap.forEach((tx) => {
        const t = tx.data();

        const packageType = (t.packageType || t.type || "").toString();
        const pkg = PACKAGES[packageType] || { price: 0, credits: 0 };
        const creditsAdded = Number(t.creditsAdded ?? 0);

        // Prefer stored revenue from the transaction doc (webhook),
        // fallback to package price only if revenue is missing.
        const revenue =
          t.revenue !== undefined && t.revenue !== null && t.revenue !== ""
            ? Number(t.revenue)
            : Number(pkg.price || 0);

        // Prefer Square identifiers if present
        const squareTx =
          t.squarePaymentId ||
          t.squareOrderId ||
          t.squareTransactionId ||
          t.transactionId ||
          t.paymentId ||
          t.orderId ||
          "";

        userRevenue += revenue;
        userCredits += creditsAdded;

        totalRevenue += revenue;
        totalCredits += creditsAdded;

        if (packageType) {
          if (!revenueByPackage[packageType]) {
            revenueByPackage[packageType] = { count: 0, revenue: 0, credits: 0 };
          }
          revenueByPackage[packageType].count++;
          revenueByPackage[packageType].revenue += revenue;
          revenueByPackage[packageType].credits += creditsAdded;
        }

        transactions.push({
          id: tx.id,
          type: t.type || "",
          packageType,
          creditsAdded,
          revenue,
          transactionId: squareTx,
          timestamp: t.timestamp?.toDate?.()?.toISOString() || t.timestamp || "",
        });
      });

      // Get credit balance
      const balSnap = await db.collection("users").doc(userDoc.id).collection("credits").doc("balance").get();
      const balance = balSnap.exists ? Number(balSnap.data()?.balance ?? 0) : 0;

      users.push({
        id: userDoc.id,
        email: u.email || "",
        displayName: u.displayName || "",
        createdAt: u.createdAt || "",
        lastLogin: u.lastLogin || "",
        creditBalance: balance,
        totalRevenue: userRevenue,
        totalCredits: userCredits,
        transactions,
      });
    }

    // SUBMISSIONS
    const subSnap = await db.collection("submissions").orderBy("createdAt", "desc").get();
    const submissions: any[] = [];
    subSnap.forEach((doc) => {
      const d = doc.data();
      submissions.push({
        id: doc.id,
        email: d.email || "",
        address: d.address || "",
        status: d.status || "",
        createdAt: d.createdAt || "",
        uid: d.uid || "",
      });
    });

    // LISTINGS
    const listSnap = await db.collection("listings").orderBy("createdAt", "desc").get();
    const listings: any[] = [];
    listSnap.forEach((doc) => {
      const d = doc.data();
      listings.push({
        id: doc.id,
        address: d.address || "",
        createdAt: d.createdAt || "",
        userId: d.userId || "",
        ownerName: d.propertyData?.ownerName || "",
        propertyType: d.propertyData?.propertyType || "",
        beds: d.propertyData?.beds || "",
        baths: d.propertyData?.baths || "",
        sqft: d.propertyData?.sqft || "",
        flood_zone: d.propertyData?.flood_zone || "",
        aiListing: d.aiListing ? "✅" : "❌",
        fieldCount: Object.keys(d.propertyData || {}).filter((k) => d.propertyData[k]).length,
      });
    });

    // STATS
    const today = new Date().toISOString().split("T")[0];
    const newUsersToday = users.filter((u) => u.createdAt?.startsWith(today)).length;
    const submissionsToday = submissions.filter((s) => s.createdAt?.startsWith(today)).length;
    const listingsToday = listings.filter((l) => l.createdAt?.startsWith(today)).length;

    // ERRORS
    const errSnap = await db.collection("errors").orderBy("createdAt", "desc").get();
    const errors: any[] = [];
    errSnap.forEach((doc) => {
      const d = doc.data();
      errors.push({
        id: doc.id,
        source: d.source || "",
        submissionId: d.submissionId || "",
        error: d.error || "",
        createdAt: d.createdAt || "",
      });
    });

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalRevenue,
        totalCredits,
        totalSubmissions: submissions.length,
        totalListings: listings.length,
        totalErrors: errors.length,
        newUsersToday,
        submissionsToday,
        listingsToday,
        revenueByPackage,
      },
      users: users.sort((a, b) => b.totalRevenue - a.totalRevenue),
      submissions,
      listings,
      errors,
    });
  } catch (err: any) {
    console.error("Admin error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
