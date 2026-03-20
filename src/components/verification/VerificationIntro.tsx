'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function VerificationIntro() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedOption, setSelectedOption] = useState<'credits' | 'payment'>('credits');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreditSubmit = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Load profile
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const profile = snap.exists() ? snap.data() : {};

      if (!profile.fullName || !profile.phone) {
        setError('Please complete your profile (full name and phone required) before submitting.');
        setSubmitting(false);
        return;
      }

      // Deduct 10 credits one at a time (10x)
      for (let i = 0; i < 10; i++) {
        const deductRes = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid }),
        });
        const deductData = await deductRes.json();
        if (!deductRes.ok) {
          setError(deductData.error || 'Insufficient credits. You need 10 credits to verify.');
          setSubmitting(false);
          return;
        }
      }

      // Submit verification
      const submitRes = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          verificationType: 'agent',
          paymentMethod: 'credits',
          creditCost: 10,
          profileComplete: true,
          fullName: profile.fullName || '',
          companyName: profile.company || '',
          phone: profile.phone || '',
          email: user.email || '',
          source: 'initial',
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.success) {
        setError(submitData.message || 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }

      router.push('/verification/pending');

    } catch (e) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">GRTP Verified</h1>
          <p className="text-lg text-slate-300">Build trust with your clients. Get verified in 48 hours.</p>
        </div>

        {/* What is GRTP Verified */}
        <div className="bg-slate-700 rounded-lg p-8 mb-8 border border-amber-500">
          <h2 className="text-2xl font-bold text-white mb-4">What is GRTP Verified?</h2>
          <p className="text-slate-200 mb-4">
            A professional trust badge that appears on all your generated RLP reports and shared links.
            It tells your clients that GetReadyToPost has verified your identity and profile.
          </p>
          <ul className="space-y-3 text-slate-200">
            <li className="flex items-start">
              <span className="text-amber-500 mr-3 font-bold">✓</span>
              <span>Badge appears on all RLP reports</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-3 font-bold">✓</span>
              <span>Badge appears on password-protected share links</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-3 font-bold">✓</span>
              <span>Verified by live phone call (48-hour review)</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-3 font-bold">✓</span>
              <span>Annual renewal keeps badge current</span>
            </li>
          </ul>
        </div>

        {/* Profile Checklist */}
        <div className="bg-slate-700 rounded-lg p-8 mb-8 border border-slate-600">
          <h2 className="text-2xl font-bold text-white mb-6">Complete Your Profile First</h2>
          <p className="text-slate-300 mb-6">All fields are recommended. Complete them to unlock verification.</p>
          <div className="space-y-4">
            {['Headshot', 'Logo', 'Company Name', 'Contact Information', 'Social Media Links'].map((item) => (
              <div key={item} className="flex items-center p-4 bg-slate-600 rounded">
                <input type="checkbox" disabled checked className="w-5 h-5 mr-4" />
                <p className="text-white font-semibold">{item}</p>
              </div>
            ))}
          </div>
          <Link href="/agent-backoffice">
            <button className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition">
              Go to Profile &amp; Complete
            </button>
          </Link>
        </div>

        {/* Payment Option */}
        <div className="bg-slate-700 rounded-lg p-8 border border-amber-500">
          <h2 className="text-2xl font-bold text-white mb-6">Choose Your Payment Method</h2>
          <p className="text-slate-300 mb-6">Annual verification fee: $19.99 or 10 credits</p>

          <div className="space-y-4 mb-6">
            <label className="flex items-center p-4 bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition">
              <input
                type="radio"
                name="payment"
                value="credits"
                checked={selectedOption === 'credits'}
                onChange={() => setSelectedOption('credits')}
                className="w-5 h-5 mr-4"
              />
              <div>
                <p className="text-white font-semibold">Use 10 Credits</p>
                <p className="text-slate-400 text-sm">Deduct from your account balance</p>
              </div>
            </label>

            <label className="flex items-center p-4 bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition">
              <input
                type="radio"
                name="payment"
                value="payment"
                checked={selectedOption === 'payment'}
                onChange={() => setSelectedOption('payment')}
                className="w-5 h-5 mr-4"
              />
              <div>
                <p className="text-white font-semibold">Pay $19.99</p>
                <p className="text-slate-400 text-sm">One-time annual payment via Square</p>
              </div>
            </label>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {selectedOption === 'payment' ? (
            <a
              href="https://square.link/u/o0gy2tby"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition text-center"
            >
              Pay $19.99 &amp; Submit for Verification →
            </a>
          ) : (
            <button
              onClick={handleCreditSubmit}
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit for Verification with 10 Credits'}
            </button>
          )}

          <p className="text-slate-400 text-xs mt-4 text-center">
            Non-refundable if profile is fake, misleading, or fails review.
            We'll call your phone number to verify your identity.
          </p>
        </div>

      </div>
    </div>
  );
}
