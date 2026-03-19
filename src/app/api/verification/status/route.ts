export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const verificationType = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId parameter.' },
        { status: 400 }
      );
    }

    const verificationStatus = {
      userId,
      verificationType: verificationType || 'personal',
      status: 'pending',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      reviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      hoursRemaining: 24,
      message: 'Your verification is under review. We will call your phone number within 48 hours.',
      nextStep: 'Ensure your phone is available during business hours (9 AM - 5 PM EST).',
    };

    return NextResponse.json({
      success: true,
      verification: verificationStatus,
    });
  } catch (error) {
    console.error('Verification status error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch verification status.' },
      { status: 500 }
    );
  }
}
