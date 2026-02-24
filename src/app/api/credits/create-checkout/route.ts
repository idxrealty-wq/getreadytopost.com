import { NextRequest, NextResponse } from 'next/server';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

const CREDIT_PACKAGES = {
  test: { amount: 150, credits: 1 },
  single: { amount: 1999, credits: 1 },
  '5pack': { amount: 8500, credits: 5 },
  monthly: { amount: 9900, credits: 99 },
  '6month': { amount: 49500, credits: 495 },
  annual: { amount: 89900, credits: 899 },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { userId, packageType } = await req.json();

    if (!userId || !packageType || !(packageType in CREDIT_PACKAGES)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];

    const payload = {
      idempotency_key: `pl-${userId}-${packageType}-${Date.now()}`,
      quick_pay: {
        name: `${packageType} Credits`,
        price_money: {
          amount: pkg.amount,
          currency: 'USD',
        },
      },
      checkout_options: {
        redirect_url: 'https://getreadytopost.com/our-deals?purchase=success',
      },
    };

    const resp = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Square error:', data);
      return NextResponse.json({ error: 'Failed to create payment link', details: data }, { status: resp.status });
    }

    const checkoutUrl = data.payment_link?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL in response' }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({ error: 'Failed to create checkout', details: String(e) }, { status: 500 });
  }
}
