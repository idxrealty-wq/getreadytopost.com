import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, location, updateNumber } = await req.json();

    if (!sessionId || !location) {
      return NextResponse.json({ error: 'sessionId and location required' }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection('showingSessions').doc(sessionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = snap.data()!;

    if (session.status !== 'alert_triggered') {
      return NextResponse.json({ error: 'No active alert' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const timeStr = new Date(now).toLocaleString('en-US', { timeZone: 'America/New_York' });
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;

    const updateHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:system-ui,sans-serif;background:#f4f4f4;margin:0;padding:0;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:24px;">
          <div style="background:#cc0000;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:1px;">LOCATION UPDATE #${updateNumber}</h1>
              <p style="color:#ffcccc;margin:4px 0 0;font-size:12px;">Showing Shield - Active Emergency</p>
            </div>
            <div style="background:#ff4444;border-radius:50%;width:14px;height:14px;"></div>
          </div>
          <div style="padding:24px 32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:120px;font-size:14px;">Agent</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${session.agentName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">Time</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${timeStr}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#666;font-size:14px;">Location</td>
                <td style="padding:8px 0;font-weight:600;font-size:14px;">${location.address}</td>
              </tr>
            </table>

            <a href="${mapsLink}" target="_blank"
              style="display:block;margin-top:20px;background:#cc0000;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;text-align:center;">
              Track Current Location
            </a>

            <p style="margin-top:16px;color:#999;font-size:11px;text-align:center;">
              Location updates are sent every 30 seconds while the phone is active.<br/>
              Call 911 immediately if you cannot reach the agent.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    for (const contact of session.emergencyContacts || []) {
      if (contact.email) {
        try {
          await resend.emails.send({
            from: 'Showing Shield <alerts@getreadytopost.com>',
            to: contact.email,
            subject: `LOCATION UPDATE #${updateNumber} - ${session.agentName} - ${location.address}`,
            html: updateHtml,
          });
        } catch {}
      }
    }

    await ref.update({
      lastKnownLocation: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        mapsLink,
        capturedAt: now,
        updateNumber,
      },
    });

    return NextResponse.json({ success: true, updateNumber });
  } catch (err: any) {
    console.error('Location update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send update' }, { status: 500 });
  }
}
