'use client';

type ChecklistItem = {
  label: string;
  description: string;
  completed: boolean;
};

type ProfileCompletionChecklistProps = {
  items?: ChecklistItem[];
};

const defaultItems: ChecklistItem[] = [
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

export default function ProfileCompletionChecklist({
  items = defaultItems,
}: ProfileCompletionChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Profile Completion Checklist</h2>
        <p className="mt-2 text-sm text-slate-300">
          Complete your profile before applying for GRTP Verified. Nothing here has to be mandatory,
          but the stronger the profile, the stronger the trust signal.
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-200">
            {completedCount} of {totalCount} completed
          </span>
          <span className="font-semibold text-amber-400">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/80 p-4"
          >
            <div
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${
                item.completed
                  ? 'border-emerald-400 bg-emerald-500 text-slate-950'
                  : 'border-slate-500 bg-slate-700 text-slate-300'
              }`}
            >
              {item.completed ? '✓' : '!'}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-white">{item.label}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    item.completed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {item.completed ? 'Complete' : 'Recommended'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-100">
          Tip: A complete profile improves how your reports look, strengthens your share pages,
          and helps your verification request move faster.
        </p>
      </div>
    </div>
  );
}
