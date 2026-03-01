import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'getreadtopost',
      clientEmail: 'firebase-adminsdk-fbsvc@getreadtopost.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAn0/HzqY0ekoz\n4ftx387MFnD+3zocLe6BeQQlQ1S/v1CCp66YO2AvEtsJ6jZA/kdokGvpJujjvlni\nv0fReCS+xFvVqT24gnutxTXvItXC6YXkjOV6Csq/ahZzQOmpqCAwR0BVZw0b9kE4\nZQGv5N5Rg2ZwLs5L7FI2Cnang4BO4JZhUqdwvRhZMxXPsKIBizDBwZoAwBMsOAQP\nrE3i2Ai9Gv5t/9EOcdE56cFGeW6cxkPM7cm+YnJQW/LylH3g1YYmLyBO6rvb49IG\nAtGrcrOwKieOsJg1MqMCdPAyHlezyfllMlTqYviAlpcw/gULNvMnVFQVSJWXWB8m\np0oW2X2jAgMBAAECggEAAKKFyMrNkW61v+YGxiFOtS19wdlKf71HA/Y6JUVLijY/\nNa8HzEil0IHnZuj2tNAhvB59vI78RYPjF/Q5cF9M/7P1+YZNRcZoUfJMczVSLwpF\n/rLYLsbKVEctO8QDASQktwQFGkL0sBrnrB/pGYNPmEUumUAOPgHRY4w1R+gPDDN/\n1BIf1+PJExnNpeqA0dLsTrJnWk5VvU690Yh/DdxR2V7Os4+q56/BAfGJ0iozXLEs\nmu3HQ1TwaCAuk9vipPWv6tim2d0jHvroXII0bzBMRbw0/3WC5Gq9ZVvEDPgyN7Fq\njgum9e4Gsu1C8JqDSyFebcF5+rV3R1pB0hcIUeV1gQKBgQDq0FsqxwoyypFlW6N9\n+OFy+69tdVUZBFZ3mLe8DrI2yAuLKQzXo6QnrrHK157TytgGYlDoIUaWo2rmXAi5\nlv8uNgsA0aKr/B+CcCo3Irw+cVUhY+6wdxQbEoox8Hf5BoQS6TH4zlAVtTGvu1s4\nGcJ5dmlgW1iw5zhEde8MxR0LKwKBgQDSAG4bdf2bBnrgMYBqwdtdCfgKhK1LLA1A\nSYuTxqrnqG4uF3mIZ6bp5wQX+E9QR9BCCPkZL9UOj8yo++xa/Zeso51e4NnblkBZ\nwjZNB9hIK00LTbWjFkJO7opCICwS9NF1WDNQwNSC2anNi54ujR1LUjceLF9QwURj\nwqvm4pc7aQKBgHZxtyryz6AjMggwm12VxxMbBbhu8Qf3ei5FqJiByT981OXTRRkZ\nAFrL8f7hmMo4jZNa0HjnIBYoRGoCjpwfIIUM2awGEsoyGSrQrVq2eMH+pPR81g/J\nYSjuxyq9o6bHtKNdYcmhOCBbD78XAMJhrAlcw3bJXQmO+IEABB8q5qWVAoGAUZq/\nLsaj/SkAeLxjtZiNYNMt4xB5stt0bsXlilBKO2k1H44ZuQrmTsBp09K3J3AwmmiY\nO9Rdi6IPmp8C0rz2wqx1y9e+cNkrOnYA2eAxiKHi94CEE9Ljg36olVehKOCfwGS8\n1CWKrypcFLarilVly84wAvalN2FS7R1J5ZepwvkCgYEAvm7mweOvSkdDxB95SKbC\nJsrClpu/HHWHYtLdKhB7K3io+jF7Tr0PuMHAUMFPtTxT3lhIsahXWGQ3DKzov+fX\nqTu+Nrv34kiZTM5Lek0OagyBm+sxfuES12w3UNYsJSFhtIiyPPUEHQIofnTvEUbX\nNZDlsJ0mUgPMli1YKi/t+f4=\n-----END PRIVATE KEY-----\n',
    }),
  });
}

const db = getFirestore();

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.toLowerCase().trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const snapshot = await db
      .collection('parcels_orange')
      .where('search_key', '>=', q)
      .where('search_key', '<=', q + '\uf8ff')
      .limit(10)
      .get();

    const results = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
