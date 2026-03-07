import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


export const dynamic = "force-dynamic";


function initAdmin() {
if (getApps().length > 0) return;


const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");


let sa: any;
try {
sa = JSON.parse(json);
} catch (e) {
throw new Error(`Invalid JSON in FIREBASE_SERVICE_ACCOUNT_JSON: ${e}`);

}


if (!sa.private_key) {
throw new Error("Service account missing private_key");
}


sa.private_key = sa.private_key.replace(/\n/g, "\n");
initializeApp({ credential: cert(sa) });
}


export async function GET(req: NextRequest) {
try {
initAdmin();
const db = getFirestore();



const url = new URL(req.url);
const userId = url.searchParams.get("userId");


if (!userId) {
  return NextResponse.json({ error: "userId required" }, { status: 400 });
}


const ref = db.collection("users").doc(userId).collection("credits").doc("balance");
const snap = await ref.get();


if (!snap.exists) {
  return NextResponse.json({ userId, balance: 0 }, { status: 200 });
}


const data = snap.data() || {};
const balance = Number(data.balance ?? data.credits ?? data.creditBalance ?? 0);


return NextResponse.json({ userId, balance }, { status: 200 });



} catch (e: any) {
console.error("Balance error:", e?.message);
return NextResponse.json({ error: `Balance: ${e?.message}` }, { status: 500 });
}
}

