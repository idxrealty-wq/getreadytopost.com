import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";

function initAdmin() {
  if (!getApps().length) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (json) {
      const sa: any = JSON.parse(json);
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      initializeApp({ credential: cert(sa) });
    } else {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
  }
}

export async function logError({
  source,
  error,
  context = {},
}: {
  source: string;
  error: any;
  context?: Record<string, any>;
}) {
  const message = error?.message || String(error) || "Unknown error";
  const stack = error?.stack || "";

  console.error(`[${source}] ERROR:`, message);

  // Log to Firestore
  try {
    initAdmin();
    const db = getFirestore();
    await db.collection("errors").add({
      source,
      error: message,
      stack,
      context,
      createdAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error(`[logError] Failed to write to Firestore:`, e?.message);
  }

  // Send email alert
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "idxrealty@gmail.com",
        subject: `🚨 GRTP Error: ${source}`,
        html: `
          <h2>🚨 API Error — ${source}</h2>
          <p><strong>Error:</strong> ${message}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          ${Object.keys(context).length ? `<p><strong>Context:</strong></p><pre>${JSON.stringify(context, null, 2)}</pre>` : ""}
          <p><strong>Stack:</strong></p>
          <pre style="font-size:11px">${stack}</pre>
        `,
      });
    }
  } catch (e: any) {
    console.error(`[logError] Failed to send email:`, e?.message);
  }
}
