type VerifiedBadgeProps = {
  badgeLabel?: string;
  status?: 'pending' | 'approved' | 'denied' | 'expired';
  verificationId?: string;
  lastVerifiedAt?: string | null;
  publicUrl?: string;
};

export default function VerifiedBadge({
  badgeLabel = 'GRTP Verified',
  status = 'pending',
  verificationId,
  lastVerifiedAt,
  publicUrl,
}: VerifiedBadgeProps) {
  const approved = status === 'approved';
  const pending = status === 'pending';
  const denied = status === 'denied';
  const expired = status === 'expired';

  const badgeClasses = approved
    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
    : pending
    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
    : denied
    ? 'border-rose-500 bg-rose-500/10 text-rose-300'
    : 'border-slate-500 bg-slate-500/10 text-slate-300';

  const statusText = approved
    ? 'Verified'
    : pending
    ? 'Pending Review'
    : denied
    ? 'Denied'
    : 'Expired';

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${badgeClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
            {badgeLabel}
          </p>
          <h3 className="mt-1 text-lg font-bold">{statusText}</h3>

          {verificationId && (
            <p className="mt-2 text-xs opacity-80">
              Verification ID: {verificationId}
            </p>
          )}

          {lastVerifiedAt && (
            <p className="mt-1 text-xs opacity-80">
              Last verified: {new Date(lastVerifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-current/30">
            <span className="text-xl font-bold">
              {approved ? '✓' : pending ? '•' : denied ? '✕' : '!'}
            </span>
          </div>
        </div>
      </div>

      {publicUrl && (
        <div className="mt-4">
          <a
            href={publicUrl}
            className="text-sm font-medium underline underline-offset-4"
          >
            View live verification
          </a>
        </div>
      )}
    </div>
  );
}
