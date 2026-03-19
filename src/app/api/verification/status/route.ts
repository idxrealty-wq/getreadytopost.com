export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

function getExpirationDate(type: string, baseDate?: Date) {
  const now = baseDate ? new Date(baseDate) : new Date();

  if (type === 'buyer_seller') {
    now.setMonth(now.getMonth() + 6);
    return now.toISOString();
  }

  now.setFullYear(now.getFullYear() + 1);
  return now.toISOString();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const verificationType = searchParams.get('type') || 'agent';

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId parameter.' },
        { status: 400 }
      );
    }

    const submittedAtDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const reviewDeadlineDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const verificationStatus = {
      id: crypto.randomUUID(),
      userId,
      verificationType,
      status: 'pending',
      submittedAt: submittedAtDate.toISOString(),
      approvedAt: null,
      lastVerifiedAt: null,
      expirationDate: null,
      reviewDeadline: reviewDeadlineDate.toISOString(),
      hoursRemaining: Math.max(
        0,
        Math.ceil((reviewDeadlineDate.getTime() - Date.now()) / (1000 * 60 * 60))
      ),
      verificationId:
        verificationType === 'company'
          ? 'GRTP-COMP-DEMO-001'
          : verificationType === 'buyer_seller'
          ? 'GRTP-BS-DEMO-001'
          : 'GRTP-AGENT-DEMO-001',
      publicSlug:
        verificationType === 'company'
          ? 'company-demo-001'
          : verificationType === 'buyer_seller'
          ? 'buyer-seller-demo-001'
          : 'agent-demo-001',
      badgeLabel:
        verificationType === 'company'
          ? 'Company Verified'
          : verificationType === 'buyer_seller'
          ? 'Buyer/Seller Verified'
          : 'GRTP Verified',
      requiresPhoneCall: verificationType !== 'buyer_seller',
      requiresEmailFollowup: true,
      reverifyCount: 0,
      source: 'initial',
      message:
        verificationType === 'buyer_seller'
          ? 'Your instant verification is under review.'
          : 'Your verification is under review. We will call your phone number within 48 hours.',
      nextStep:
        verificationType === 'buyer_seller'
          ? 'Watch your email for confirmation and any follow-up requests.'
          : 'Ensure your phone is available during business hours (9 AM - 5 PM EST).',
      lastVerifiedDisplayDate: null,
      nextEligibleReverificationDate: getExpirationDate(verificationType, new Date()),
    };

    return NextResponse.json({
      success: true,
      verifications: [verificationStatus],
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch verification status.' },
      { status: 500 }
    );
  }
}
