'use client';

import { format } from 'date-fns';

type PendingVerificationCardProps = {
  submittedDate?: Date;
  verificationDeadline?: Date;
  status?: 'pending' | 'approved' | 'denied';
  denialReason?: string;
};

export default function PendingVerificationCard({
  submittedDate = new Date(),
  verificationDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000),
  status = 'pending',
  denialReason,
}: PendingVerificationCardProps) {
  const formattedSubmitted = format(submittedDate, 'MMM d, yyyy h:mm a');
  const formattedDeadline = format(verificationDeadline, 'MMM d, yyyy h:mm a');
  const hoursRemaining = Math.ceil(
    (verificationDeadline.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  return (
    <div className="space-y-4">
      {status === 'pending' && (
        <div className="rounded-2xl border border-amber-500 bg-amber-500/10 p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-amber-300">Pending Verification</h2>
              <p className="text-sm text-amber-200">Your badge is under review</p>
            </div>
          </div>

          <div className="mb-6 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Submitted
              </p>
              <p className="mt-1 text-sm text-slate-200">{formattedSubmitted}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                Review Deadline
              </p>
              <p className="mt-1 text-sm text-slate-200">{formattedDeadline}</p>
              <p className="mt-1 text-xs text-amber-300">
                {hoursRemaining > 0
                  ? `${hoursRemaining} hours remaining`
                  : 'Review should be complete'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <h3 className="text-lg font-semibold text-white">What happens now</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-amber-400">1.</span>
                <span>Our team reviews your profile for completeness and professionalism</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">2.</span>
                <span>
                  A direct phone call is made to the phone number on your profile
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">3.</span>
                <span>
                  We must be able to speak with you to confirm your identity and profile accuracy
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">4.</span>
                <span>
                  If approved, your GRTP Verified badge is applied to all reports and share pages
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <h3 className="font-semibold text-white">Make sure we can reach you</h3>
            <p className="mt-2 text-sm text-slate-300">
              Please ensure the phone number on your profile is current and that you can answer
              calls during business hours (9 AM - 5 PM EST). If we cannot reach you, your
              verification may be delayed or denied.
            </p>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-500/10 p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-300">Verified</h2>
              <p className="text-sm text-emerald-200">Your badge is now active</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-sm text-slate-200">
              Your GRTP Verified badge now appears on all your generated RLP reports and shared
              links. Your clients will see the trust signal immediately.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <h3 className="font-semibold text-white">Next step: Company Verified (optional)</h3>
            <p className="mt-2 text-sm text-slate-300">
              Add a second badge by verifying your company or brokerage for an additional $10 or
              10 credits. This strengthens the trust signal even more.
            </p>
          </div>
        </div>
      )}

      {status === 'denied' && (
        <div className="rounded-2xl border border-rose-500 bg-rose-500/10 p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center">
              <span className="text-2xl">✕</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-rose-300">Verification Denied</h2>
              <p className="text-sm text-rose-200">Your badge application was not approved</p>
            </div>
          </div>

          {denialReason && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">
                Reason
              </p>
              <p className="mt-2 text-sm text-slate-200">{denialReason}</p>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
            <h3 className="font-semibold text-white">What to do next</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Review your profile for completeness and accuracy</li>
              <li>• Ensure all information is current and professional</li>
              <li>• Make corrections and resubmit your verification request</li>
              <li>• Contact support if you have questions about the denial</li>
            </ul>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Note: Verification fees for denied submissions are non-refundable per our policy.
          </p>
        </div>
      )}
    </div>
  );
}
