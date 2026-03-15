import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

const SQUARE_WEBHOOK_SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

function verifySquareSignature(body: string, signature: string): boolean {
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    console.warn("[Webhook] SQUARE_WEBHOOK_SIGNATURE_KEY not set, skipping verification");
    return true;
  }

  const hash = crypto
    .createHmac("sha256", SQUARE_WEBHOOK_SIGNATURE_KEY)
    .update(body)
    .digest("base64");

  return hash === signature;
}

function getPackageDetails(lineName: string, quantity: number) {
  const normalized = lineName.toLowerCase().replace(/\s+/g, "");

  if (normalized.includes("single")) {
    return {
      packageType: "single",
      creditsToAdd: 1,
      revenue: 19.99,
      subscription: null,
    };
  }

  if (normalized.includes("5pack")) {
    return {
      packageType: "5pack",
      creditsToAdd: 5,
      revenue: 85.0,
      subscription: null,
    };
  }

  if (normalized.includes("monthly")) {
    return {
      packageType: "monthly",
      creditsToAdd: 30,
      revenue: 30.0,
      subscription: {
        planId: "monthly",
        status: "active",
        creditsPerCycle: 30,
        propertyPullPrice: 3,
        vaultAccess: true,
        workspaceAccess: true,
        billingCycle: "monthly",
      },
    };
  }

  if (normalized.includes("6month") || normalized.includes("semiannual")) {
    return {
      packageType: "6month",
      creditsToAdd: 300,
      revenue: 495.0,
      subscription: {
        planId: "semi-annual",
        status: "active",
        creditsPerCycle: 300,
        propertyPullPrice: 2.5,
        vaultAccess: true,
        workspaceAccess: true,
        billingCycle: "semi-annual",
      },
    };
  }

  if (normalized.includes("elite")) {
    return {
      packageType: "elite-annual",
      creditsToAdd: 899,
      revenue: 999.0,
      subscription: {
        planId: "elite-annual",
        status: "active",
        creditsPerCycle: 899,
        propertyPullPrice: 1,
        vaultAccess: true,
        workspaceAccess: true,
        billingCycle: "annual",
      },
    };
  }

  if (normalized.includes("annual")) {
    return {
      packageType: "annual",
      creditsToAdd: 450,
      revenue: 899.0,
      subscription: {
        planId: "annual",
        status: "active",
        creditsPerCycle: 450,
        propertyPullPrice: 1.75,
        vaultAccess: true,
        workspaceAccess: true,
        billingCycle: "annual",
      },
    };
  }

  if (normalized.includes("vault")) {
    return {
      packageType: "vault-only",
      creditsToAdd: 0,
      revenue: 49.95,
      subscription: {
        planId: "vault-only",
        status: "active",
        creditsPerCycle: 0,
        propertyPullPrice: 0,
        vaultAccess: true,
        workspaceAccess: false,
        billingCycle: "annual",
      },
    };
  }

  if (normalized.includes("credit")) {
    return {
      packageType: "credits",
      creditsToAdd: quantity,
      revenue: quantity * 1.0,
      subscription: null,
    };
  }

  return null;
}

function getRenewalDate(billingCycle: "monthly" | "semi-annual" | "annual") {
  const renewalDate = new Date();

  if (billingCycle === "monthly") {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else if (billingCycle === "semi-annual") {
    renewalDate.setMonth(renewalDate.getMonth() + 6);
  } else {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }

  return renewalDate;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-square-hmac-sha256") || "";

    if (!verifySquareSignature(body, signature)) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const data = JSON.parse(body);
    const eventType = data.type;

    console.log(`[Webhook] Received event: ${eventType}`);

    if (eventType !== "payment.created") {
      return NextResponse.json({ success: true, ignored: eventType });
    }

    const payment = data.data?.object?.payment;

    if (!payment) {
      console.log("[Webhook] No payment object found");
      return NextResponse.json({ success: true });
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;

    if (!orderId) {
      console.log("[Webhook] No order_id on payment");
      return NextResponse.json({ success: true });
    }

    console.log(`[Webhook] Processing payment ${paymentId} for orderId: ${orderId}`);

    const adminDb = getAdminDb();
    const processedRef = adminDb.collection("webhook_processed").doc(paymentId);
    const processedSnap = await processedRef.get();

    if (processedSnap.exists) {
      console.log(`[Webhook] Payment ${paymentId} already processed, skipping`);
      return NextResponse.json({ success: true, idempotent: true });
    }

    await processedRef.set({
      paymentId,
      orderId,
      status: "processing",
      createdAt: FieldValue.serverTimestamp(),
    });

    if (!SQUARE_ACCESS_TOKEN) {
      throw new Error("SQUARE_ACCESS_TOKEN is not set");
    }

    const orderResp = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      headers: {
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      },
    });

    const orderText = await orderResp.text();

    if (!orderResp.ok) {
      console.error("[Webhook] Failed to fetch order:", orderText);
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }

    const orderData = JSON.parse(orderText);
    const userId = orderData.order?.reference_id;
    const lineItem = orderData.order?.line_items?.[0];
    const lineName = lineItem?.name || "";
    const quantity = parseInt(lineItem?.quantity || "1", 10);

    if (!userId) {
      console.error("[Webhook] No userId (reference_id) on order");
      return NextResponse.json({ error: "No userId on order" }, { status: 500 });
    }

    const packageDetails = getPackageDetails(lineName, quantity);

    if (!packageDetails) {
      console.error("[Webhook] Could not determine package from order:", lineName);
      return NextResponse.json({ error: "Could not determine package" }, { status: 500 });
    }

    const { packageType, creditsToAdd, revenue, subscription } = packageDetails;

    console.log(
      `[Webhook] Processing package ${packageType} for user ${userId} with ${creditsToAdd} credits`
    );

    const userRef = adminDb.collection("users").doc(userId);
    const userCreditsRef = userRef.collection("credits").doc("balance");

    if (creditsToAdd > 0) {
      await userCreditsRef.set(
        {
          balance: FieldValue.increment(creditsToAdd),
        },
        { merge: true }
      );
    }

        if (subscription) {
      const billingCycleMap: Record<string, "monthly" | "semi-annual" | "annual"> = {
        monthly: "monthly",
        "semi-annual": "semi-annual",
        annual: "annual",
        "elite-annual": "annual",
        "vault-only": "annual",
      };
      const billingCycle = billingCycleMap[subscription.billingCycle] || "annual";
      const renewalDate = getRenewalDate(billingCycle);
      await userRef.set(
        {
          subscription: {
            planId: subscription.planId,
            status: subscription.status,
            creditsPerCycle: subscription.creditsPerCycle,
            propertyPullPrice: subscription.propertyPullPrice,
            vaultAccess: subscription.vaultAccess,
            workspaceAccess: subscription.workspaceAccess,
            renewalDate,
            lastPaymentDate: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );
    }
    const transactionsRef = userRef.collection("transactions");

    await transactionsRef.add({
      type: "purchase",
      packageType,
      creditsAdded: creditsToAdd,
      revenue,
      orderId,
      paymentId,
      squarePaymentId: paymentId,
      squareOrderId: orderId,
      subscriptionApplied: !!subscription,
      timestamp: FieldValue.serverTimestamp(),
      source: "square-webhook",
    });

    await processedRef.update({
      userId,
      creditsAdded: creditsToAdd,
      packageType,
      revenue,
      subscriptionApplied: !!subscription,
      status: "completed",
      processedAt: FieldValue.serverTimestamp(),
    });

    console.log(`[Webhook] Successfully processed ${packageType} for ${userId}`);

    return NextResponse.json({
      success: true,
      userId,
      creditsAdded: creditsToAdd,
      packageType,
      revenue,
      subscriptionApplied: !!subscription,
    });
  } catch (e: any) {
    console.error("[Webhook] Error:", e);

    await import("@/lib/logError").then(({ logError }) =>
      logError({ source: "square-webhook", error: e, context: {} })
    );

    return NextResponse.json(
      { error: "Failed", details: String(e) },
      { status: 500 }
    );
  }
}
