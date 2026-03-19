'use client';

import { useState } from 'react';

type CompanyVerificationPanelProps = {
  personalVerificationApproved?: boolean;
  creditBalance?: number;
  companyVerificationStatus?: 'locked' | 'available' | 'pending' | 'approved';
};

export default function CompanyVerificationPanel({
  personalVerificationApproved = false,
  creditBalance = 0,
  companyVerificationStatus = 'locked',
}: CompanyVerificationPanelProps) {
  const [selectedOption, setSelectedOption] = useState<'credits' | 'cash'>('credits');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [userTitle, setUserTitle] = useState('');

  const hasEnoughCredits = creditBalance >= 10;
  const isLocked = !personalVerificationApproved;
  const canSubmit =
    companyName.trim() &&
    companyPhone.trim() &&
    userTitle.trim() &&
    !isLocked &&
    (hasEnoughCredits || selectedOption === 'cash');

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Company Verified (Optional)</h2>
        <p className="mt-2 text-sm text-slate-300">
          Add a second trust badge by verifying your company or brokerage affiliation.
        </p>
      </div>

      {isLocked ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="font-semibold text-amber-300">Locked</p>
          <p className="mt-2 text-sm text-slate-200">
            Company Verified requires an approved GRTP Verified badge first. We must verify the
            person before we verify the company.
          </p>
        </div>
      ) : companyVerificationStatus === 'approved' ? (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-emerald-400">✓</span>
            <div>
              <p className="font-semibold text-emerald-300">Company Verified</p>
              <p className="mt-1 text-sm text-slate-200">
                Your company badge is now active and appears on all your reports and share pages.
              </p>
            </div>
          </div>
        </div>
      ) : companyVerificationStatus === 'pending' ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <p className="font-semibold text-amber-300">Pending Company Verification</p>
              <p className="mt-1 text-sm text-slate-200">
                Your company verification is under review. We will call your company to confirm
                your employment.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <h3 className="font-semibold text-white">What we'll verify</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>A direct phone call is made to your company's main number</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>We confirm you work at the company in the role you specified</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>Your Company Verified badge is applied to all reports and share pages</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>Annual renewal is required to keep the badge active</span>
              </li>
            </ul>
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Company / Brokerage Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Keller Williams Realty"
                disabled={isLocked}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Company Phone Number *
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="e.g., (555) 123-4567"
                disabled={isLocked}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Your Title / Role *
              </label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                placeholder="e.g., Real Estate Agent, Broker Associate"
                disabled={isLocked}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-slate-200">Choose payment method</p>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4 disabled:opacity-50">
                <input
                  type="radio"
                  name="company-payment"
                  className="mt-1"
                  checked={selectedOption === 'credits'}
                  onChange={() => setSelectedOption('credits')}
                  disabled={isLocked}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">Pay with Credits</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        hasEnoughCredits
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      Balance: {creditBalance}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Use 10 credits for annual Company Verified.
                  </p>
                  {!hasEnoughCredits && (
                    <p className="mt-2 text-xs text-rose-300">
                      You do not have enough credits for this option.
                    </p>
                  )}
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/80 p-4 disabled:opacity-50">
                <input
                  type="radio"
                  name="company-payment"
                  className="mt-1"
                  checked={selectedOption === 'cash'}
                  onChange={() => setSelectedOption('cash')}
                  disabled={isLocked}
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">Pay $10</p>
                  <p className="mt-1 text-sm text-slate-300">
                    One-time annual payment via Square.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="button"
            disabled={!canSubmit || isLocked}
            className="w-full rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit for Company Verification
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Non-refundable if company verification fails or information is inaccurate.
          </p>
        </>
      )}
    </div>
  );
}
