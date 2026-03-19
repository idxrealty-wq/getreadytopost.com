import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      paymentMethod,
      creditCost,
      cashAmount,
      profileComplete,
      fullName,
      phone,
      email,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId.' },
        { status: 400 }
      );
    }

    if (!profileComplete) {
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

    const verificationSubmission = {
      userId,
      verificationType: 'personal',
      status: 'pending',
      paymentMethod: paymentMethod || 'credits',
      creditCost: creditCost ?? 10,
      cashAmount: cashAmount ?? 10,
      submittedAt: new Date().toISOString(),
      reviewDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      fullName,
      phone,
      email,
      notes: 'Pending live phone verification call.',
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
