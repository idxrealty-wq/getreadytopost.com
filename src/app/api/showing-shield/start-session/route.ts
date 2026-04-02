import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { agentId, agentName, agentEmail, agentPhone, propertyAddress, clientName, scheduledDuration } =
      await req.json();

    if (!agentId || !propertyAddress || !clientName || !scheduledDuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminDb();

    // Get emergency contacts from profile
    const profileRef = db.collection('showingShieldProfiles').doc(agentId);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      return NextResponse.json(
        { error: 'No emergency contacts configured. Please set up your safety profile first.' },
        { status: 400 }
      );
    }

    const profile = profileSnap.data();
    const emergencyContacts = profile?.emergencyContacts || [];

    if (emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts configured. Please set up your safety profile first.' },
        { status: 400 }
      );
    }

    const sessionRef = await db.collection('showingSessions').add({
      agentId,
      agentName,
      agentEmail,
      agentPhone,
      propertyAddress,
      clientName,
      scheduledDuration,
      status: 'active',
      startedAt: new Date().toISOString(),
      emergencyContacts,
      createdAt: new Date().toISOString(),
    });

    // Send tracking link to all emergency contacts
    const trackingLink = `${req.nextUrl.origin}/showing-shield/track?id=${agentId}`;
    const sessionTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const contactEmails = emergencyContacts
      .filter((c: any) => c.email)
      .map((c: any) => c.email);

    if (contactEmails.length > 0) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Showing Shield <alerts@getreadytopost.com>',
            to: contactEmails,
            subject: `🛡️ ${agentName || 'Someone you know'} has started a safety session`,
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#08152b;color:#ffffff;border-radius:12px;overflow:hidden;">
                <div style="background:#0d1f3c;padding:24px 32px;border-bottom:2px solid #c9a227;">
                  <h1 style="margin:0;color:#c9a227;font-size:22px;">🛡️ Showing Shield</h1>
                  <p style="margin:6px 0 0;color:#aaaaaa;font-size:13px;">Live Safety Tracking Alert</p>
                </div>
                <div style="padding:32px;">
                  <p style="font-size:16px;margin:0 0 8px;"><strong style="color:#c9a227;">${agentName || 'A contact'}</strong> has started a safety session and shared their live location with you.</p>
                  <p style="color:#aaaaaa;font-size:13px;margin:0 0 24px;">Session started: ${sessionTime}</p>
                  <div style="background:#0d1f3c;border:1px solid #c9a227;border-radius:10px;padding:20px;margin-bottom:24px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#aaaaaa;">PROPERTY / LOCATION</p>
                    <p style="margin:0;font-size:15px;font-weight:bold;">${propertyAddress}</p>
                  </div>
                  <a href="${trackingLink}" style="display:block;background:#c9a227;color:#08152b;text-align:center;padding:16px;border-radius:10px;font-size:16px;font-weight:bold;text-decoration:none;margin-bottom:16px;">
                    👁️ Watch Live Location
                  </a>
                  <p style="color:#666666;font-size:12px;text-align:center;margin:0;">This link updates automatically every 10 seconds. No login required.<br/>Bookmark it to check back anytime during the session.</p>
                </div>
                <div style="background:#0d1f3c;padding:16px 32px;border-top:1px solid #1a2b4a;">
                  <p style="margin:0;color:#555555;font-size:11px;text-align:center;">Powered by Showing Shield · getreadytopost.com</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error('Failed to send tracking link emails:', emailErr);
        // Non-fatal — session still starts even if email fails
      }
    }

    return NextResponse.json({ success: true, sessionId: sessionRef.id });
  } catch (err: any) {
    console.error('Start session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to start session' }, { status: 500 });
  }
}
