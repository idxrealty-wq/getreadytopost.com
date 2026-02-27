import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name || "");
    const email = String(body?.email || "");
    const feedback = String(body?.feedback || body?.message || "");

    if (!email || !feedback) {
      return NextResponse.json(
        { error: "Email and feedback are required" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "idxrealty@gmail.com",
      subject: `GRTP Feedback from ${name || "Anonymous"} (${email})`,
      html: `
        <h2>New Feedback</h2>
        <p><strong>Name:</strong> ${name || "Anonymous"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Feedback:</strong></p>
        <p style="white-space: pre-wrap;">${feedback}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Feedback API error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to send feedback" },
      { status: 500 }
    );
  }
}
