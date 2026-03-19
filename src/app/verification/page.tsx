'use client';

import { useState } from 'react';
import VerificationIntro from '@/components/verification/VerificationIntro';
import ProfileCompletionChecklist from '@/components/verification/ProfileCompletionChecklist';
import BadgePurchasePanel from '@/components/verification/BadgePurchasePanel';
import CompanyVerificationPanel from '@/components/verification/CompanyVerificationPanel';
import PendingVerificationCard from '@/components/verification/PendingVerificationCard';
import VerifiedBadge from '@/components/verification/VerifiedBadge';

export default function VerificationPage() {
  const [personalVerificationStatus, setPersonalVerificationStatus] = useState<
    'pending' | 'approved' | 'denied' | 'expired' | 'none'
  >('none');

  const checklistItems = [
    {
      label: 'Headshot',
      description: 'Professional photo used on reports and branded share pages.',
      completed: false,
    },
    {
      label: 'Logo',
      description: 'Business or personal brand logo for report branding.',
      completed: false,
    },
    {
      label: 'Company Information',
      description: 'Brokerage or business name and role/title.',
      completed: false,
    },
    {
      label: 'Contact Information',
      description: 'Phone, email, website, and office address.',
      completed: false,
    },
    {
      label: 'Social Media Links',
      description: 'Facebook, LinkedIn, Instagram, or other public business links.',
      completed: false,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 pt-28 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <VerificationIntro />
        </section>

        {personalVerificationStatus === 'approved' && (
          <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8">
            <h2 className="mb-6 text-2xl font-bold text-white">Your Verification Status</h2>
            <VerifiedBadge
              badgeLabel="GRTP Verified"
              status="approved"
              verificationId="GRTP-AGENT-DEMO-001"
              lastVerifiedAt={new Date().toISOString()}
              publicUrl="/verification/record/agent-demo-001"
            />
          </section>
        )}

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <ProfileCompletionChecklist items={checklistItems} />
          </div>
          <div>
            <BadgePurchasePanel
              creditBalance={25}
              personalVerifiedApproved={personalVerificationStatus === 'approved'}
            />
          </div>
        </section>

        {personalVerificationStatus === 'pending' && (
          <section>
            <PendingVerificationCard
              status="pending"
              submittedDate={new Date()}
              verificationDeadline={new Date(Date.now() + 48 * 60 * 60 * 1000)}
            />
          </section>
        )}

        <section>
          <CompanyVerificationPanel
            personalVerificationApproved={personalVerificationStatus === 'approved'}
            creditBalance={25}
            companyVerificationStatus="locked"
          />
        </section>
      </div>
    </main>
  );
}
