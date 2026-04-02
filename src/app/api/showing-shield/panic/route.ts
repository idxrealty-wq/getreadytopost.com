import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAdminDb } from '@/lib/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { sessionId, location, evidenceUrls } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const db = getAdminDb();
    const ref = db.collection('showingSessions').doc(sessionId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = snap.data()!;
    const now = new Date().toISOString();
    const mapsLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : null;

    const photoHtml = Array.isArray(evidenceUrls) && evidenceUrls.length > 0
      ? `
        <h2 style="color:#cc0000;margin-top:32px;">Evidence Photos</h2>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${evidenceUrls.map((url: string, i: number) => `
            <a href="${url}" target="_blank">
              <img src="${url}" alt="Evidence photo ${i + 1}"
                style="width:200px;height:150px;object-fit:cover;border-radius:8px;border:2px solid #cc0000;" />
            </a>
          `).join('')}
        </div>
        <p style="margin-top:8px;font-size:12px;color:#666;">Click any photo to view full size</p>
      `
      : `<p style="color:#666;margin-top:24px;">No evidence photos captured.</p>`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:system-ui,sans-serif;background:#f4f4f4;margin:0;padding:0;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:24px;">
          
          <div style="background:#cc0000;padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">
              SHOWING SHIELD
            </h1>
            <p style="color:#ffcccc;margin:4px 0 0;font-size:14px;">EMERGENCY ALERT</p>
          </div>

          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;width:140px;font-size:14px;">Agent</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${session.agentName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">Agent Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${session.agentPhone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">Property</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${session.propertyAddress}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">Client Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${session.clientName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;">Time</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;font-size:14px;">${new Date(now).toLocaleString('en-US', { timeZone: 'America/New_York' })}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#666;font-size:14px;">Location</td>
                <td style="padding:10px 0;font-weight:600;font-size:14px;">${location ? location.address : 'Not available'}</td>
              </tr>
            </table>

            ${mapsLink ? `
              <a href="${mapsLink}" target="_blank"
                style="display:inline-block;margin-top:24px;background:#cc0000;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
                View Live Location on Map
              </a>
            ` : ''}

            ${photoHtml}

            <div style="margin-top:40px;padding-top:24px;border-top:1px solid #eee;">
              <p style="color:#999;font-size:12px;margin:0;">
                This is an automated emergency alert from Showing Shield by GetReadyToPost.com.<br/>
                If this was a false alarm, please contact the agent directly.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailsSent: string[] = [];

    for (const contact of session.emergencyContacts || []) {
      if (contact.email) {
        try {
          await resend.emails.send({
            from: 'Showing Shield <alerts@getreadytopost.com>',
            to: contact.email,
            subject: `EMERGENCY ALERT - ${session.agentName} - ${session.propertyAddress}`,
            html: emailHtml,
          });
          emailsSent.push(contact.email);
        } catch (emailErr) {
          console.error(`Email failed to ${contact.email}:`, emailErr);
        }
      }
    }

    await ref.update({
      status: 'alert_triggered',
      panicTriggeredAt: now,
      alertsSent: emailsSent,
      evidenceUrls: evidenceUrls || [],
      ...(location && {
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
          mapsLink,
          capturedAt: now,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      alertsSent: emailsSent.length,
      message: `Emergency alert sent to ${emailsSent.length} contact(s).`,
    });
  } catch (err: any) {
    console.error('Panic route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to send alert' }, { status: 500 });
  }
}
