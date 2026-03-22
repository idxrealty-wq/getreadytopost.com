import Link from "next/link";

const steps = [
  {
    title: "Upload the listing details",
    description:
      "Paste the MLS remarks, property highlights, and any notes you want reviewed. Start with the exact copy you plan to use so the grade and rewrite are based on the real listing.",
  },
  {
    title: "Get the grade and rewrite",
    description:
      "Rate My Listing scores the description, flags weak spots, and generates a stronger version built for clarity, accuracy, and buyer response.",
  },
  {
    title: "Add photos, area details, and reports",
    description:
      "Build a stronger presentation with Google exterior images, local area information, and supporting documents you can organize inside your workspace.",
  },
  {
    title: "Deliver a cleaner client-ready package",
    description:
      "Use the finished copy, saved assets, and organized reports to present the property more professionally and move faster from draft to market.",
  },
];

const features = [
  {
    title: "Rate My Listing",
    description:
      "Grade MLS remarks, identify weak language, and generate a stronger rewrite with practical recommendations you can actually use.",
  },
  {
    title: "Rapid Listing Packages",
    description:
      "Create polished property packages with stronger copy, supporting visuals, and organized materials for agents, brokers, and sellers.",
  },
  {
    title: "Agent Workspace",
    description:
      "Keep listing drafts, saved rewrites, property notes, and supporting files in one place so each listing stays organized.",
  },
  {
    title: "Password-Protected Documents",
    description:
      "Share selected materials securely when you need clients or collaborators to review documents without exposing everything.",
  },
  {
    title: "Google Exterior Photos",
    description:
      "Pull in exterior property visuals to support presentations, previews, and listing packages with better visual context.",
  },
  {
    title: "Area Information",
    description:
      "Add useful local context that helps explain the property, the setting, and the surrounding area in a more complete way.",
  },
];

const pricingCards = [
  {
    name: "Rate My Listing Report",
    price: "$19.99",
    detail: "One-time report",
    description:
      "Get the listing graded, rewritten, and improved with actionable recommendations.",
    cta: "Get Your Grade",
    href: "/pricing",
  },
  {
    name: "Monthly Membership",
    price: "$30/mo",
    detail: "Ongoing access",
    description:
      "Best for agents who want recurring access to rewrites, workspace tools, and listing support.",
    cta: "View Memberships",
    href: "/pricing",
  },
  {
    name: "FSBO Launch Package",
    price: "$100",
    detail: "One-time package",
    description:
      "Built for for-sale-by-owner users who need copy help, workspace access, and a starting credit pack.",
    cta: "See FSBO Options",
    href: "/pricing",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section 
        className="relative bg-cover bg-center bg-no-repeat border-b border-white/10"
        style={{
          backgroundImage: "url('https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/2877900c-e6c5-4ba7-9574-26e0d591ae7b/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/75 to-slate-950/85"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm font-medium text-amber-200">
                Professional MLS copy tools for agents, brokers, and sellers
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Stronger listing copy, cleaner presentation, and a better way to prepare properties for market
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                GetReadyToPost helps you improve listing descriptions, organize property materials,
                and build a more polished presentation from the first draft to the final package.
                Start with Rate My Listing, then expand into rewrites, visuals, area details,
                and client-ready documents.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  View Pricing
                </Link>
                <Link
                  href="/rate-my-listing"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/5"
                >
                  Try Rate My Listing
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Grade the remarks</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Identify what is weak, vague, repetitive, or missing before the listing goes live.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Rewrite with purpose</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Turn flat MLS copy into a tighter, clearer description that supports buyer response.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">Package it professionally</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Combine copy, visuals, reports, and notes into a more complete listing workflow.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Start here
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Rate My Listing gives you the fastest path to a better description
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Submit the listing remarks, get a grade, review the rewrite, and use the recommendations
                  to improve clarity, structure, and impact before you publish.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
                <p className="text-sm font-semibold text-amber-200">
                  Built for practical listing work
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  This is not generic marketing copy. It is designed to help you tighten listing language,
                  improve presentation quality, and move faster with a repeatable workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              What you can do with GetReadyToPost
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              A complete toolkit for listing copy, property presentation, and agent workspace organization.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:bg-white/10 hover:border-white/20"
              >
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Listing View Page
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Share a polished, public-facing property presentation with photos, details, supporting materials, and verification badges.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  A cleaner way to present properties
                </h3>
                <p className="text-slate-300 mb-6">
                  The Listing View Page is your public-facing property presentation. It combines your improved listing copy, 
                  exterior photos, area information, supporting documents, and verification status all in one clean, 
                  professional layout that you can share with buyers, agents, and stakeholders.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-slate-300">Improved listing copy front and center</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-slate-300">Google exterior photos and property visuals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-slate-300">Area details and neighborhood context</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-slate-300">Password-protected supporting documents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-slate-300">Verification badge showing listing review status</span>
                  </li>
                </ul>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Learn More
                </Link>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-white/5">
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
      Listing View Example
    </p>
    <div className="space-y-4">
      <div className="h-32 bg-gradient-to-br from-amber-400/20 to-slate-700/20 rounded-lg border border-white/10 flex items-center justify-center">
        <span className="text-slate-400 text-sm">Property Photo Preview</span>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded w-3/4"></div>
        <div className="h-3 bg-white/10 rounded w-full"></div>
        <div className="h-3 bg-white/10 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-emerald-400/30 rounded-full px-3 text-xs flex items-center text-emerald-200 border border-emerald-400/50">
          ✓ Verified
        </div>
      </div>
    </div>

    <div className="mt-5 pt-5 border-t border-white/10">
      <a
        href="https://getreadytopost.com/listing/listing_1771692871525_iffpctrb3"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm font-semibold text-amber-300 hover:text-amber-200 transition"
      >
        View live example →
      </a>
    </div>
  </div>
</div>

            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Verification & Trust
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Every listing can be verified through our API-assisted review process, giving buyers and agents confidence 
              that the property has been professionally reviewed and presented.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-3">API-Assisted Review</h3>
              <p className="text-slate-300">
                Our system uses text analysis and verification APIs to review listing copy, flag issues, and confirm 
                that materials meet professional standards.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold text-white mb-3">Verification Badge</h3>
              <p className="text-slate-300">
                Verified listings display a badge on the Listing View Page, showing that the property has been reviewed 
                and meets our quality standards.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-white mb-3">Buyer Confidence</h3>
              <p className="text-slate-300">
                Verification builds trust with buyers and agents by confirming that listings have been professionally 
                prepared and reviewed before presentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pricing built for your workflow
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Start with a single report or commit to ongoing access. Choose what fits your listing volume and goals.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pricingCards.map((card) => (
              <div
                key={card.name}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 flex flex-col"
              >
                <h3 className="text-xl font-semibold text-white">{card.name}</h3>
                <p className="mt-2 text-sm text-slate-400">{card.detail}</p>

                <div className="mt-6 mb-6">
                  <p className="text-4xl font-bold text-amber-400">{card.price}</p>
                </div>

                <p className="flex-1 text-sm leading-6 text-slate-300">{card.description}</p>

                <Link
                  href={card.href}
                  className="mt-8 inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300 w-full"
                >
                  {card.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
            <p className="text-center text-sm leading-7 text-slate-300">
              All plans include access to the workspace, document storage, and the ability to save and organize your work.
              <br />
              <Link href="/pricing" className="font-semibold text-amber-400 hover:text-amber-300">
                View full plan details and features →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to improve your listing copy?
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
              Start with Rate My Listing to grade and rewrite a single description, or explore memberships for ongoing access.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/rate-my-listing"
                className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Try Rate My Listing
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/5"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/rate-my-listing" className="text-sm text-slate-400 hover:text-white">
                    Rate My Listing
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-slate-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/workspace" className="text-sm text-slate-400 hover:text-white">
                    Workspace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/faq" className="text-sm text-slate-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-slate-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Legal</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-slate-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-slate-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="mailto:support@getreadytopost.com" className="text-sm text-slate-400 hover:text-white">
                    support@getreadytopost.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-sm text-slate-400">
              © 2026 GetReadyToPost. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
