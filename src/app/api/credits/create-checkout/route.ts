import { NextRequest, NextResponse } from 'next/server';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

const CREDIT_PACKAGES = {
  test: { amount: 150, credits: 1 },
  single: { amount: 1999, credits: 1 },
  '5pack': { amount: 8500, credits: 5 },
  monthly: { amount: 3000, credits: 30 },
  '6month': { amount: 49500, credits: 495 },
  annual: { amount: 89900, credits: 899 },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { userId, packageType, quantity } = await req.json();

    if (!userId || !packageType) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    let amount: number;
    let credits: number;
    let itemName: string;

    if (packageType === 'credit') {
      const qty = Math.min(Math.max(parseInt(String(quantity), 10) || 1, 1), 250);
      amount = qty * 100;
      credits = qty;
      itemName = `GetReadyToPost Credits (${qty})`;
    } else if (packageType in CREDIT_PACKAGES) {
      const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
      amount = pkg.amount;
      credits = pkg.credits;
      itemName = `${packageType} Credits`;
    } else {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
    }

    const idempotencyKey = `pl-${userId}-${packageType}-${quantity || 1}-${Date.now()}`;

    const payload = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: userId,
        line_items: [
          {
            name: itemName,
            quantity: '1',
            base_price_money: {
              amount,
              currency: 'USD',
            },
          },
        ],
      },
      checkout_options: {
        redirect_url: 'https://getreadytopost.com/success?tier=credits',
      },
    };

    const baseUrl =
      process.env.SQUARE_ENV === 'sandbox'
        ? 'https://connect.squareupsandbox.com'
        : 'https://connect.squareup.com';

    const resp = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from Square', details: text },
        { status: 500 }
      );
    }

    if (!resp.ok) {
      console.error('Square API error:', data);
      return NextResponse.json(
        { error: 'Square API error', details: data },
        { status: resp.status }
      );
    }

    const checkoutUrl = data.payment_link?.url;
    const checkoutId = data.payment_link?.id;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL in response', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      checkoutId,
      credits,
    });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json(
      { error: 'Server error', details: String(e) },
      { status: 500 }
    );
  }
}
