import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

function generateVerificationId(type: string) {
  const prefix =
    type === 'company' ? 'GRTP-COMP' :
    type === 'buyer_seller' ? 'GRTP-BS' : 'GRTP-AGENT';
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
      return NextResponse.json({ success: false, message: 'Missing userId.' }, { status: 400 });
    }

    if (verificationType !== 'buyer_seller' && !profileComplete) {
      return NextResponse.json({ success: false, message: 'Profile must be completed before verification.' }, { status: 400 });
    }

    if (!fullName || !phone || !email) {
      return NextResponse.json({ success: false, message: 'Missing required profile details.' }, { status: 400 });
    }

    if (verificationType === 'company' && !companyName) {
      return NextResponse.json({ success: false, message: 'Missing company name for company verification.' }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const reviewDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const verificationRecord = {
      userId,
      verificationType,
      status: 'pending',
      paymentMethod: paymentMethod || 'credits',
      creditCost: creditCost ?? (verificationType === 'company' || source === 'reverification' ? 10 : 10),
      cashAmount: cashAmount ?? (verificationType === 'company' || source === 'reverification' ? 10 : 19.99),
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
      notes: verificationType === 'buyer_seller'
        ? 'Pending instant verification review.'
        : 'Pending live phone verification call.',
      reverifyCount: source === 'reverification' ? 1 : 0,
      source,
      requiresPhoneCall: verificationType !== 'buyer_seller',
      requiresEmailFollowup: true,
      badgeLabel: verificationType === 'company'
        ? 'Company Verified'
        : verificationType === 'buyer_seller'
        ? 'Buyer/Seller Verified'
        : 'GRTP Verified',
      lastVerifiedDisplayDate: null,
      nextEligibleReverificationDate: getExpirationDate(verificationType),
      createdAt: FieldValue.serverTimestamp(),
    };

    const db = getAdminDb();

    // Write to verifications collection
    const verRef = await db.collection('verifications').add(verificationRecord);

    // Also write to user's subcollection
    await db
      .collection('users')
      .doc(userId)
      .collection('verification')
      .doc('badge')
      .set({
        status: 'pending',
        verificationId: verificationRecord.verificationId,
        publicSlug: verificationRecord.publicSlug,
        submittedAt,
        reviewDeadline,
        badgeLabel: verificationRecord.badgeLabel,
        verificationType,
        docId: verRef.id,
      }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Verification submitted successfully.',
      verification: { ...verificationRecord, docId: verRef.id },
    });

  } catch (error) {
    console.error('Verification submit error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit verification request.' }, { status: 500 });
  }
}
