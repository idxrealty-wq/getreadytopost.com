import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({
        userId,
        subscription: {
          planId: "none",
          status: "inactive",
          vaultAccess: false,
          workspaceAccess: false,
        },
      });
    }

    const userData = userSnap.data() || {};
    const sub = userData.subscription || {};

    return NextResponse.json({
      userId,
      subscription: {
        planId: sub.planId || "none",
        status: sub.status || "inactive",
        vaultAccess: sub.vaultAccess === true,
        workspaceAccess: sub.workspaceAccess === true,
        creditsPerCycle: sub.creditsPerCycle || 0,
        propertyPullPrice: sub.propertyPullPrice || 0,
        billingCycle: sub.billingCycle || null,
        renewalDate: sub.renewalDate || null,
      },
    });
  } catch (e: any) {
    console.error("Entitlements check error:", e?.message || e);
    return NextResponse.json(
      { error: `Entitlements: ${e?.message || String(e)}` },
      { status: 500 }
    );
  }
}
