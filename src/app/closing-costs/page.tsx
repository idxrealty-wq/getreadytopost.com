export const metadata = {
  title: "Closing Costs Calculator (Coming Soon) | GetReadyToPost",
  description: "Our Orange County, FL closing costs calculator is coming soon.",
};

export default function ClosingCostsComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            GetReadyToPost.com
          </p>

          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Closing Costs Calculator — Coming Soon
          </h1>

          <p className="mt-4 text-slate-300">
            We’re building an agent-grade closing cost calculator focused on Florida
            (starting with Orange County). It’ll include buyer + seller line items,
            doc stamps, recording, and clean totals—built for speed and accuracy.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href="https://getreadytopost.com/rate-my-listing"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500"
            >
              Use Rate My Listing
            </a>

            <a
              href="https://getreadytopost.com/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/40 px-5 py-3 font-bold text-slate-100 hover:bg-slate-900"
            >
              View Pricing
            </a>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            Note: This page is intentionally live to prevent broken navigation while
            we finish the calculator.
          </p>
        </div>
      </div>
    </div>
  );
}
