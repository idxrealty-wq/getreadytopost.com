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

type PackageResult = {
  packageType: string;
  creditsToAdd: number;
  revenue: number;
  subscription: {
    planId: string;
    status: string;
    creditsPerCycle: number;
    propertyPullPrice: number;
    vaultAccess: boolean;
    workspaceAccess: boolean;
    billingCycle: string;
  } | null;
};

function getPackageDetails(params: {
  lineName?: string;
  quantity?: number;
  amountMoney?: number;
  metadataPackageType?: string;
}): PackageResult | null {
  const lineName = params.lineName || "";
  const quantity = params.quantity || 1;
  const amountMoney = params.amountMoney || 0;
  const metadataPackageType = (params.metadataPackageType || "").toLowerCase().trim();

  const normalized = lineName.toLowerCase().replace(/[\s\-_]+/g, "");

  const packageMap: Record<string, PackageResult> = {
    single: {
      packageType: "single",
      creditsToAdd: 1,
      revenue: 19.99,
      subscription: null,
    },
    "5pack": {
      packageType: "5pack",
      creditsToAdd: 5,
      revenue: 85.0,
      subscription: null,
    },
    monthly: {
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
    },
    "semi-annual": {
      packageType: "semi-annual",
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
    },
    "6month": {
      packageType: "semi-annual",
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
    },
    annual: {
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
    },
    "elite-annual": {
      packageType: "elite-annual",
      creditsToAdd: 899,
      revenue: 999.0,
      subscription: {
        planId: "elite-annual",
        status: "active",
        creditsPerCycle: 899,
        propertyPullPrice: 1.0,
        vaultAccess: true,
        workspaceAccess: true,
        billingCycle: "annual",
      },
    },
    "vault-only": {
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
    },
  };

  if (metadataPackageType && packageMap[metadataPackageType]) {
    return packageMap[metadataPackageType];
  }

  if (normalized.includes("eliteannual")) {
    return packageMap["elite-annual"];
  }

  if (normalized.includes("semiannual") || normalized.includes("6month") || normalized.includes("6months")) {
    return packageMap["semi-annual"];
  }

  if (normalized.includes("monthly")) {
    return packageMap["monthly"];
  }

  if (normalized.includes("annual")) {
    return packageMap["annual"];
  }

  if (normalized.includes("5pack")) {
    return packageMap["5pack"];
  }

  if (normalized.includes("single")) {
    return packageMap["single"];
  }

  if (normalized.includes("vault")) {
    return packageMap["vault-only"];
  }

  if (amountMoney === 3000) {
    return packageMap["monthly"];
  }

  if (amountMoney === 49500) {
    return packageMap["semi-annual"];
  }

  if (amountMoney === 89900) {
    return packageMap["annual"];
  }

  if (amountMoney === 99900) {
    return packageMap["elite-annual"];
  }

  if (amountMoney === 8500) {
    return packageMap["5pack"];
  }

  if (amountMoney === 1999) {
    return packageMap["single"];
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
      await processedRef.update({
        status: "failed",
        error: "Failed to fetch order",
        orderFetchResponse: orderText,
        failedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }

    const orderData = JSON.parse(orderText);
    
    // DETAILED LOGGING - Log the entire order object to see what Square returns
    console.log("[Webhook] Full order data from Square:", JSON.stringify(orderData, null, 2));
    
    const userId = orderData.order?.reference_id;
    const lineItem = orderData.order?.line_items?.[0];
    const lineName = lineItem?.name || "";
    const quantity = parseInt(lineItem?.quantity || "1", 10);
    const amountMoney = lineItem?.base_price_money?.amount || 0;
    const metadataPackageType = orderData.order?.metadata?.packageType || "";

    // DETAILED LOGGING - Log extracted fields
    console.log("[Webhook] Extracted fields:", {
      userId,
      lineName,
      quantity,
      amountMoney,
      metadataPackageType,
      referenceId: orderData.order?.reference_id,
      allOrderFields: Object.keys(orderData.order || {}),
    });

    if (!userId) {
      console.error("[Webhook] No userId (reference_id) on order");
      await processedRef.update({
        status: "failed",
        error: "No userId on order",
        orderDataSnapshot: JSON.stringify(orderData),
        failedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ error: "No userId on order" }, { status: 500 });
    }

    const packageDetails = getPackageDetails({
      lineName,
      quantity,
      amountMoney,
      metadataPackageType,
    });

    if (!packageDetails) {
      console.error("[Webhook] Could not determine package from order:", {
        lineName,
        quantity,
        amountMoney,
        metadataPackageType,
      });
      await processedRef.update({
        status: "failed",
        error: "Could not determine package",
        lineName,
        quantity,
        amountMoney,
        metadataPackageType,
        failedAt: FieldValue.serverTimestamp(),
      });
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
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (subscription) {
      const billingCycleMap: Record<string, "monthly" | "semi-annual" | "annual"> = {
        monthly: "monthly",
        "semi-annual": "semi-annual",
        annual: "annual",
      };

      const billingCycle =
        billingCycleMap[subscription.billingCycle] || "annual";
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
            billingCycle: subscription.billingCycle,
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
      lineName,
      amountMoney,
      metadataPackageType,
      timestamp: FieldValue.serverTimestamp(),
      source: "square-webhook",
    });

    await processedRef.update({
      userId,
      creditsAdded: creditsToAdd,
      packageType,
      revenue,
      subscriptionApplied: !!subscription,
      lineName,
      amountMoney,
      metadataPackageType,
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

    try {
      const adminDb = getAdminDb();
      await adminDb.collection("errors").add({
        source: "square-webhook",
        message: String(e),
        stack: e?.stack || null,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (logErr) {
      console.error("[Webhook] Failed to write error log:", logErr);
    }

    await import("@/lib/logError").then(({ logError }) =>
      logError({ source: "square-webhook", error: e, context: {} })
    );

    return NextResponse.json(
      { error: "Failed", details: String(e) },
      { status: 500 }
    );
  }
}
