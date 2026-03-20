'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function PendingVerificationPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/verification/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const latest = data.verifications?.[0];
        if (latest?.status) setStatus(latest.status);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mb-4" />
            <p className="text-slate-300">Loading your verification status...</p>
          </div>
        ) : status === 'approved' ? (
          <div className="bg-slate-800 rounded-2xl border border-emerald-500 p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white mb-2">You are Verified!</h1>
            <p className="text-slate-300 mb-6">Your GRTP Verified badge is now active and will appear on all your reports and share links.</p>
            <Link href="/agent-backoffice">
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition">Go to My Profile</button>
            </Link>
          </div>
        ) : status === 'denied' ? (
          <div className="bg-slate-800 rounded-2xl border border-red-500 p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-white mb-2">Verification Denied</h1>
            <p className="text-slate-300 mb-6">Unfortunately your verification request was not approved. Please contact us at support@getreadytopost.com for more information.</p>
            <Link href="/verification">
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition">Try Again</button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-amber-500 p-8 text-center">
            <div className="text-6xl mb-6">🕐</div>
            <h1 className="text-3xl font-bold text-white mb-3">Verification Request Received</h1>
            <p className="text-slate-300 text-lg mb-2">Thank you for submitting your GRTP Verified request.</p>
            <p className="text-amber-300 font-semibold text-lg mb-6">Expect a call from us within 24 hours to verify your identity.</p>
            <div className="bg-slate-700/60 rounded-xl p-4 mb-8 text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold mt-0.5">1.</span>
                <p className="text-slate-300 text-sm">We will call the phone number on your profile to confirm your identity.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold mt-0.5">2.</span>
                <p className="text-slate-300 text-sm">Once verified, your GRTP Verified badge will be activated within 48 hours.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold mt-0.5">3.</span>
                <p className="text-slate-300 text-sm">Your badge will appear on all reports and share links automatically.</p>
              </div>
            </div>
            <Link href="/agent-backoffice">
              <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 rounded-xl transition w-full">Back to My Profile</button>
            </Link>
            <p className="text-slate-500 text-xs mt-4">Questions? Email us at support@getreadytopost.com</p>
          </div>
        )}
      </div>
    </main>
  );
}
