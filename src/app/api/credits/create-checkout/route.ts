import { NextRequest, NextResponse } from 'next/server';

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

const CREDIT_PACKAGES = {
  test: { amount: 150, credits: 1, type: 'one-time' },
  single: { amount: 1999, credits: 1, type: 'one-time' },
  '5pack': { amount: 8500, credits: 5, type: 'one-time' },
  monthly: { amount: 3000, credits: 30, type: 'subscription', billingCycle: 'monthly' },
  'semi-annual': { amount: 49500, credits: 300, type: 'subscription', billingCycle: 'semi-annual' },
  annual: { amount: 89900, credits: 450, type: 'subscription', billingCycle: 'annual' },
  'elite-annual': { amount: 99900, credits: 899, type: 'subscription', billingCycle: 'annual' },
} as const;

type PackageInfo = {
  type: 'one-time' | 'subscription';
  billingCycle?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userId, packageType, email, quantity } = await req.json();

    if (!userId || !packageType) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    let amount: number;
    let credits: number;
    let itemName: string;
    let packageInfo: PackageInfo = { type: 'one-time' };

    if (packageType === 'credit') {
      const qty = Math.min(Math.max(parseInt(String(quantity), 10) || 1, 1), 250);
      amount = qty * 100;
      credits = qty;
      itemName = `GetReadyToPost Credits (${qty})`;
      packageInfo = { type: 'one-time' };
    } else if (packageType in CREDIT_PACKAGES) {
      const pkg = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
      amount = pkg.amount;
      credits = pkg.credits;
      itemName = `${packageType} Plan - ${credits} credits`;

      if ('billingCycle' in pkg) {
        packageInfo = { type: pkg.type, billingCycle: pkg.billingCycle };
      } else {
        packageInfo = { type: pkg.type };
      }
    } else {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
    }

    const idempotencyKey = `pl-${userId}-${packageType}-${Date.now()}`;

    const successUrl = new URL('https://getreadytopost.com/success');
    successUrl.searchParams.set('tier', packageType);
    successUrl.searchParams.set('credits', String(credits));
    successUrl.searchParams.set('type', packageInfo.type);
    successUrl.searchParams.set('userId', userId);

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
        metadata: {
          userId,
          packageType,
          email: email || 'unknown',
          subscriptionType: packageInfo.type,
          billingCycle: packageInfo.billingCycle || 'one-time',
        },
      },
      checkout_options: {
        redirect_url: successUrl.toString(),
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
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data: any;

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

    if (!checkoutUrl || !checkoutId) {
      return NextResponse.json(
        { error: 'No checkout URL or checkout ID in response', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      checkoutId,
      credits,
      packageType,
      subscriptionType: packageInfo.type,
    });
  } catch (e) {
    console.error('Checkout error:', e);

    return NextResponse.json(
      { error: 'Server error', details: String(e) },
      { status: 500 }
    );
  }
}
