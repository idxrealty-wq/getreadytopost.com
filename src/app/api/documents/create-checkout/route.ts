import { NextRequest, NextResponse } from "next/server";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const PLATFORM_FEE_PERCENT = 0.06;

export async function POST(req: NextRequest) {
  try {
    const { listingId, docId, docLabel, priceInDollars, party } = await req.json();

    if (!listingId || !docId || !priceInDollars) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const amountInCents = Math.round(parseFloat(priceInDollars) * 100);
    const platformFee = Math.round(amountInCents * PLATFORM_FEE_PERCENT);

    const baseUrl = process.env.SQUARE_ENV === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const payload = {
      idempotency_key: `doc-${listingId}-${docId}-${Date.now()}`,
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: `${listingId}__${docId}`,
        line_items: [
          {
            name: docLabel || "Document Unlock",
            quantity: "1",
            note: `Responsible: ${party || "Buyer"} | Platform fee: $${(platformFee / 100).toFixed(2)}`,
            base_price_money: {
              amount: amountInCents,
              currency: "USD",
            },
          },
        ],
      },
      checkout_options: {
        redirect_url: `https://getreadytopost.com/listing/${listingId}/share?payment=success&docId=${docId}`,
      },
    };

    const resp = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json({ error: "Square API error", details: data }, { status: resp.status });
    }

    const checkoutUrl = data.payment_link?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "No checkout URL", details: data }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (e) {
    return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
  }
}