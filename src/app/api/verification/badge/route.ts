export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('id');

    if (!verificationId) {
      return NextResponse.json(
        { success: false, message: 'Missing verification ID.' },
        { status: 400 }
      );
    }

    const record = {
      verificationId,
      badgeLabel:
        verificationId.startsWith('GRTP-COMP')
          ? 'Company Verified'
          : verificationId.startsWith('GRTP-BS')
          ? 'Buyer/Seller Verified'
          : 'GRTP Verified',
      status: 'approved',
      verifiedEntityName: 'Christopher Sampson',
      entityType: 'Broker',
      lastVerifiedAt: new Date().toISOString(),
      expirationDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      publicRecordUrl: 'https://getreadytopost.com/verification/record/agent-demo-001',
    };

    return NextResponse.json(
      { success: true, record },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
        },
      }
    );
  } catch (error) {
    console.error('Badge API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch badge data.' },
      { status: 500 }
    );
  }
}
