'use client';

import { useState } from 'react';

type BadgePurchasePanelProps = {
  creditBalance?: number;
  personalVerifiedApproved?: boolean;
};

const SQUARE_LINKS = {
  agentVerified: 'https://square.link/u/o0gy2tby',
  companyVerified: 'https://square.link/u/Z8le2Ijg',
  verifyMyAgent: 'https://square.link/u/X74D5bgW',
  verifiedBuyerSeller: 'https://square.link/u/xe0oMnV6',
  reverification: 'https://square.link/u/XjhkSbC3',
};

export default function BadgePurchasePanel({
  creditBalance = 0,
  personalVerifiedApproved = false,
}: BadgePurchasePanelProps) {
  const [selectedOption, setSelectedOption] = useState<'credits' | 'cash'>('credits');
  const hasEnoughCredits = creditBalance >= 10;
  const companyVerificationUnlocked = personalVerifiedApproved;

  return (
    <div className="space-y-6">

      {/* GRTP Agent Verified */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Apply for GRTP Verified</h2>
          <p className="mt-2 text-sm text-slate-300">
            Complete your profile first, then submit your verification request.
            Your badge application will be reviewed within 48 hours.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="text-lg font-semibold text-amber-300">What happens next</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>• Your profile is reviewed for completeness and professionalism</li>
            <li>• A direct phone call is made to the phone number on your profile</li>
            <li>• We must be able to speak with the person being verified</li>
            <li>• If approved, your GRTP Verified badge is applied to your reports and share pages</li>
          </ul>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-200">Choose payment method</p>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
              <input
                type="radio"
                name="verification-payment"
                className="mt-1"
                checked={selectedOption === 'credits'}
                onChange={() => setSelectedOption('credits')}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">Pay with Credits</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    hasEnoughCredits ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    Balance: {creditBalance}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Use 10 credits to submit your annual GRTP Verified request.
                </p>
                {!hasEnoughCredits && (
                  <p className="mt-2 text-xs text-rose-300">
                    You do not currently have enough credits for this option.
                  </p>
                )}
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
              <input
                type="radio"
                name="verification-payment"
                className="mt-1"
                checked={selectedOption === 'cash'}
                onChange={() => setSelectedOption('cash')}
              />
              <div className="flex-1">
                <p className="font-semibold text-white">Pay $19.99 <span className="text-slate-400 font-normal text-xs">/year</span></p>
                <p className="mt-1 text-sm text-slate-300">
                  Submit your annual verification request with a direct Square payment.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
          <h3 className="text-lg font-semibold text-white">Important policy notes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Verification is reviewed within 48 hours</li>
            <li>• Payment does not guarantee approval</li>
            <li>• Fake, misleading, or non-compliant submissions are non-refundable</li>
            <li>• Annual renewal is required to keep the badge active</li>
          </ul>
        </div>

        {selectedOption === 'cash' ? (
          <a
            href={SQUARE_LINKS.agentVerified}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 text-center transition hover:bg-amber-300"
          >
            Pay $19.99 &amp; Submit for Verification →
          </a>
        ) : (
          <button
            type="button"
            className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Submit for Verification with Credits
          </button>
        )}
      </div>

      {/* Reverification */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Reverification</h2>
        <p className="mt-1 text-sm text-slate-300 mb-5">
          Keep your badge active with an annual reverification. Required every 12 months to maintain GRTP Verified status.
        </p>
        <a
          href={SQUARE_LINKS.reverification}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-slate-700 px-4 py-3 font-bold text-white text-center transition hover:bg-slate-600"
        >
          Renew Verification — $10.00/yr →
        </a>
      </div>

      {/* Verify My Agent */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Verify My Agent</h2>
        <p className="mt-1 text-sm text-slate-300 mb-5">
          Are you a buyer or seller? Request verification of your agent's GRTP credentials for peace of mind before signing.
        </p>
        <a
          href={SQUARE_LINKS.verifyMyAgent}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-slate-700 px-4 py-3 font-bold text-white text-center transition hover:bg-slate-600"
        >
          Verify My Agent — $10.00 one-time →
        </a>
      </div>

      {/* Verified Buyer/Seller */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Verified Buyer / Seller</h2>
        <p className="mt-1 text-sm text-slate-300 mb-5">
          Get your own verified status as a buyer or seller. Show agents and brokers you are a serious, vetted participant in the transaction.
        </p>
        <a
          href={SQUARE_LINKS.verifiedBuyerSeller}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-slate-700 px-4 py-3 font-bold text-white text-center transition hover:bg-slate-600"
        >
          Get Verified — $10.00 one-time →
        </a>
      </div>

      {/* Company Verified */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white">Company Verified</h2>
          <p className="mt-2 text-sm text-slate-300">
            Add a second badge by verifying the company or brokerage behind the verified user.
          </p>
        </div>

        {companyVerificationUnlocked ? (
          <>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 mb-5">
              <p className="font-semibold text-emerald-300">Unlocked</p>
              <p className="mt-1 text-sm text-slate-200">
                Your GRTP Verified badge is approved. You can now apply for Company Verified.
              </p>
            </div>
            <a
              href={SQUARE_LINKS.companyVerified}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 text-center transition hover:bg-amber-300"
            >
              Apply for Company Verified — $10.00/yr →
            </a>
          </>
        ) : (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">Locked until personal verification is approved</p>
            <p className="mt-1 text-sm text-slate-200">
              Company Verified requires an approved GRTP Verified badge first.
              We must verify the person before we verify the company.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
