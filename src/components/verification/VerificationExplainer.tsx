export default function VerificationExplainer() {
  const steps = [
    {
      step: '01',
      title: 'Complete Your Profile',
      description:
        'Add your headshot, logo, brokerage info, contact details, and social links. A complete profile is required before applying.',
    },
    {
      step: '02',
      title: 'Submit for Review',
      description:
        'Our team reviews your profile for completeness, professionalism, and MLS compliance. Most reviews are completed within 48 hours.',
    },
    {
      step: '03',
      title: 'Receive Your Badge',
      description:
        'Once approved, your GRTP Verified badge is activated. It appears on your reports, share pages, and your public verification record.',
    },
    {
      step: '04',
      title: 'Share Your Record',
      description:
        'Every verified agent gets a unique public URL — a live trust page clients and buyers can visit to confirm your credentials.',
    },
  ];

  const trustSignals = [
    {
      icon: '🏅',
      title: 'What the Badge Means',
      body: 'The GRTP Verified badge signals that an agent has a complete, professional profile and uses MLS-compliant listing copy. It is a credibility marker — not just a logo.',
    },
    {
      icon: '🔍',
      title: 'How Buyers & Clients Use It',
      body: 'Anyone can visit your public verification record at getreadytopost.com/verification/record/[your-id]. Clients can confirm your status before signing a listing agreement.',
    },
    {
      icon: '🏢',
      title: 'Company Verification',
      body: 'Brokerages and teams can earn a Company Verified badge once all participating agents hold individual verification. Unlocks team-branded reports and co-branded share pages.',
    },
    {
      icon: '🔄',
      title: 'Annual Renewal',
      body: 'Verification is valid for 12 months. You will receive a renewal reminder before expiration. Keeping your profile current ensures uninterrupted badge status.',
    },
  ];

  return (
    <div className="space-y-16">

      {/* What Is GRTP Verification */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          What Is GRTP Verification?
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          A Trust Credential Built for Real Estate Professionals
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">
          GRTP Verification is a professional credentialing program that confirms an agent has a
          complete, accurate, and MLS-compliant presence on GetReadyToPost. Verified agents receive
          a badge displayed on every report, share page, and public record — giving buyers,
          sellers, and fellow agents an instant trust signal.
        </p>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
          In a market where listing quality directly impacts days-on-market and sale price,
          verification tells the world you take your craft seriously.
        </p>
      </div>

      {/* How It Works — Steps */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          How It Works
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          Four Steps to Getting Verified
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-4xl font-black text-emerald-500/30">{s.step}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signal Cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Why It Matters
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          Everything the Badge Covers
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {trustSignals.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-3xl">{item.icon}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Public Record CTA */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Live Example
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          See a Verification Record in Action
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          Every verified agent gets a permanent public URL. Clients can visit it anytime to
          confirm your credentials are current and active.
        </p>
        <a
          href="/verification/record/agent-demo-001"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          View Demo Verification Record →
        </a>
      </div>

    </div>
  );
}
