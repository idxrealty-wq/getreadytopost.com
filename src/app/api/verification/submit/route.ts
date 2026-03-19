import { NextResponse } from 'next/server';

function generateVerificationId(type: string) {
  const prefix =
    type === 'company'
      ? 'GRTP-COMP'
      : type === 'buyer_seller'
      ? 'GRTP-BS'
      : 'GRTP-AGENT';

  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

function generatePublicSlug() {
  return Math.random().toString(36).substring(2, 12);
}

function getExpirationDate(type: string) {
  const now = new Date();

  if (type === 'buyer_seller') {
    now.setMonth(now.getMonth() + 6);
    return now.toISOString();
  }

  now.setFullYear(now.getFullYear() + 1);
  return now.toISOString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      verificationType = 'agent',
      paymentMethod,
      creditCost,
      cashAmount,
      profileComplete,
      fullName,
      companyName,
      phone,
      email,
      source = 'initial',
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId.' },
        { status: 400 }
      );
    }

    if (verificationType !== 'buyer_seller' && !profileComplete) {
      return NextResponse.json(
        { success: false, message: 'Profile must be completed before verification.' },
        { status: 400 }
      );
    }

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required profile details.' },
        { status: 400 }
      );
    }

    if (verificationType === 'company' && !companyName) {
      return NextResponse.json(
        { success: false, message: 'Missing company name for company verification.' },
        { status: 400 }
      );
    }

    const submittedAt = new Date().toISOString();
    const reviewDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const verificationSubmission = {
      id: crypto.randomUUID(),
      userId,
      verificationType,
      status: 'pending',
      paymentMethod: paymentMethod || 'credits',
      creditCost:
        creditCost ??
        (verificationType === 'company' || source === 'reverification' ? 10 : 19),
      cashAmount:
        cashAmount ??
        (verificationType === 'company' || source === 'reverification' ? 10 : 19.99),
      submittedAt,
      approvedAt: null,
      lastVerifiedAt: null,
      expirationDate: null,
      reviewDeadline,
      verificationId: generateVerificationId(verificationType),
      publicSlug: generatePublicSlug(),
      fullName,
      companyName: companyName || null,
      phone,
      email,
      denialReason: null,
      notes:
        verificationType === 'buyer_seller'
          ? 'Pending instant verification review.'
          : 'Pending live phone verification call.',
      reverifyCount: source === 'reverification' ? 1 : 0,
      source,
      requiresPhoneCall: verificationType !== 'buyer_seller',
      requiresEmailFollowup: true,
      badgeLabel:
        verificationType === 'company'
          ? 'Company Verified'
          : verificationType === 'buyer_seller'
          ? 'Buyer/Seller Verified'
          : 'GRTP Verified',
      lastVerifiedDisplayDate: null,
      nextEligibleReverificationDate: getExpirationDate(verificationType),
    };

    return NextResponse.json({
      success: true,
      message: 'Verification submitted successfully.',
      verification: verificationSubmission,
    });
  } catch (error) {
    console.error('Verification submit error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit verification request.' },
      { status: 500 }
    );
  }
}
