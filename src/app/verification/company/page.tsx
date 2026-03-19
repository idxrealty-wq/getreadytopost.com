'use client';
import CompanyVerificationPanel from '@/components/verification/CompanyVerificationPanel';
import Link from 'next/link';

export default function CompanyVerificationPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Company Verified</h1>
          <p className="mt-2 text-lg text-slate-300">
            Add a second trust badge by verifying your company affiliation
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Why Company Verified?</h2>
          <ul className="space-y-3 text-slate-200">
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold mt-1">✓</span>
              <span>Strengthens trust signal on all your reports and share pages</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold mt-1">✓</span>
              <span>Shows clients your company affiliation and role</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold mt-1">✓</span>
              <span>Verified by direct call to your company main number</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-500 font-bold mt-1">✓</span>
              <span>Annual renewal keeps badge current and active</span>
            </li>
          </ul>
        </div>

        <CompanyVerificationPanel
          personalVerificationApproved={true}
          creditBalance={25}
          companyVerificationStatus="available"
        />

        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Important Notes</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Company Verified requires an approved GRTP Verified badge</li>
            <li>• We will call your company's main number to verify employment</li>
            <li>• Make sure the company phone number is current and monitored</li>
            <li>• Annual renewal is required to keep the badge active</li>
            <li>• Non-refundable if company verification fails or info is inaccurate</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/verification">
            <button className="rounded-lg border border-slate-600 hover:border-slate-500 text-white font-bold px-6 py-2 transition">
              Back to Verification
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
