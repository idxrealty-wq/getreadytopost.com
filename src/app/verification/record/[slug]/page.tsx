type VerificationRecordPageProps = {
  params: {
    slug: string;
  };
};

export default function VerificationRecordPage({
  params,
}: VerificationRecordPageProps) {
  const mockRecord = {
    slug: params.slug,
    badgeLabel: 'GRTP Verified',
    status: 'approved',
    verificationId: 'GRTP-AGENT-DEMO-001',
    verifiedEntityName: 'Christopher Sampson',
    entityType: 'Agent',
    lastVerifiedAt: new Date().toISOString(),
    expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString(),
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Live Verification Record
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          {mockRecord.badgeLabel}
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-emerald-300">
              {mockRecord.status}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Verification ID</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {mockRecord.verificationId}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Verified Entity</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {mockRecord.verifiedEntityName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Entity Type</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {mockRecord.entityType}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Last Verified Date</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {new Date(mockRecord.lastVerifiedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Expiration Date</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {new Date(mockRecord.expirationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-100">
            This verification record is displayed as a live trust signal for reports,
            profiles, and shared pages inside GetReadyToPost.
          </p>
        </div>
      </div>
    </main>
  );
}
