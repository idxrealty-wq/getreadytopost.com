import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
      personalVerificationApproved,
      paymentMethod,
      creditCost,
      cashAmount,
      companyName,
      companyPhone,
      userTitle,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId.' },
        { status: 400 }
      );
    }

    if (!personalVerificationApproved) {
      return NextResponse.json(
        {
          success: false,
          message: 'Personal verification must be approved before company verification.',
        },
        { status: 400 }
      );
    }

    if (!companyName || !companyPhone || !userTitle) {
      return NextResponse.json(
        { success: false, message: 'Missing required company details.' },
        { status: 400 }
      );
    }

    const companyVerificationSubmission = {
      userId,
      verificationType: 'company',
      status: 'pending',
      paymentMethod: paymentMethod || 'credits',
      creditCost: creditCost ?? 10,
      cashAmount: cashAmount ?? 10,
      submittedAt: new Date().toISOString(),
      reviewDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      companyName,
      companyPhone,
      userTitle,
      notes: 'Pending live phone verification call to company.',
    };

    return NextResponse.json({
      success: true,
      message: 'Company verification submitted successfully.',
      verification: companyVerificationSubmission,
    });
  } catch (error) {
    console.error('Company verification submit error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to submit company verification request.' },
      { status: 500 }
    );
  }
}
