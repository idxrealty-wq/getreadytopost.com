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

    const orderPayload = {
      idempotency_key: `order-${userId}-${packageType}-${Date.now()}`,
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: userId,
        line_items: [
          {
            name: `${packageType} Credits`,
            quantity: '1',
            base_price_money: { amount: pkg.amount, currency: 'USD' },
          },
        ],
      },
    };

    const orderResp = await fetch('https://connect.squareup.com/v2/orders', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResp.ok) {
      const error = await orderResp.text();
      console.error('Square Orders error:', error);
      return NextResponse.json({ error: 'Failed to create order', details: error }, { status: orderResp.status });
    }

    const orderData = await orderResp.json();
    const orderId = orderData.order.id;

    const linkPayload = {
      idempotency_key: `link-${orderId}-${Date.now()}`,
      order: {
        id: orderId,
      },
      checkout_options: {
        redirect_url: 'https://getreadytopost.com/our-deals?purchase=success',
      },
    };

    const linkResp = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(linkPayload),
    });

    if (!linkResp.ok) {
      const error = await linkResp.text();
      console.error('Square Payment Links error:', error);
      return NextResponse.json({ error: 'Failed to create payment link', details: error }, { status: linkResp.status });
    }

    const linkData = await linkResp.json();
    const checkoutUrl = linkData.payment_link?.url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL in response', details: JSON.stringify(linkData) }, { status: 500 });
    }

    return NextResponse.json({ checkout_url: checkoutUrl });
  } catch (e) {
    console.error('Create checkout error:', e);
    return NextResponse.json({ error: 'Failed to create checkout', details: String(e) }, { status: 500 });
  }
}
