import { NextRequest, NextResponse } from 'next/server';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

const CREDIT_PACKAGES = {
  single: { amount: 1999, credits: 1 },
  '5pack': { amount: 8500, credits: 5 },
  monthly: { amount: 9900, credits: 99 },
  '6month': { amount: 49500, credits: 495 },
  annual: { amount: 89900, credits: 899 },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { userId, packageType } = await req.json();

    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: 'Square env vars missing' }, { status: 500 });
    }

    if (!userId || !packageType || !(packageType in CREDIT_PACKAGES)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];

    const paymentLinkPayload = {
      idempotency_key: `${userId}-${packageType}-${Date.now()}`,
      quick_pay: {
        name: `${packageType} Credits`,
        price_money: {
          amount: pkg.amount,
          currency: 'USD',
        },
        location_id: SQUARE_LOCATION_ID,
        description: `Purchase ${pkg.credits} credits for GetReadyToPost`,
      },
      checkout_options: {
        redirect_url: 'https://getreadytopost.com/our-deals?purchase=success',
        ask_for_shipping_address: false,
      },
      order_id: undefined,
    };

    const resp = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Square error:', data);
      return NextResponse.json({ error: 'Failed to create payment link', details: JSON.stringify(data) }, { status: resp.status });
    }

    const checkoutUrl = data.payment_link?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL in response', details: JSON.stringify(data) }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (e) {
    console.error('Create checkout error:', e);
    return NextResponse.json({ error: 'Failed to create checkout', details: String(e) }, { status: 500 });
  }
}
