'use client';

import Link from 'next/link';

export default function AdvertisePage() {
  const stats = [
    { label: 'Active Agents on Platform', value: '12,500+' },
    { label: 'Listings Analyzed', value: '250,000+' },
    { label: 'Markets Covered', value: '48 States' },
    { label: 'Avg. Monthly Impressions', value: '2.1M+' },
  ];

  const vendorTypes = [
    {
      icon: '🏠',
      title: 'Home Inspectors',
      desc: 'Connect with agents who need trusted inspection partners.',
    },
    {
      icon: '📋',
      title: 'Title & Escrow Companies',
      desc: 'Stay visible to agents looking for reliable closing support.',
    },
    {
      icon: '💰',
      title: 'Mortgage Lenders',
      desc: 'Reach agents who need dependable lending partners.',
    },
    {
      icon: '📊',
      title: 'Appraisers',
      desc: 'Show up where agents search for valuation support.',
    },
    {
      icon: '⚖️',
      title: 'Real Estate Attorneys',
      desc: 'Position your legal services in front of professionals.',
    },
    {
      icon: '📸',
      title: 'Photographers & Stagers',
      desc: 'Get discovered by listing agents needing marketing assets.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Apply & Get Approved',
      desc: 'Submit your business details for review.',
    },
    {
      number: '2',
      title: 'Build Your Vendor Profile',
      desc: 'Add company details, video, links, and brand assets.',
    },
    {
      number: '3',
      title: 'Get Discovered by Agents',
      desc: 'Appear in category placements and market visibility.',
    },
  ];

  const tiers = [
    {
      name: 'Local',
      desc: 'City or county-level visibility.',
      slots: 'Limited availability',
      features: [
        'City/county targeting',
        'Vendor profile',
        'Verified badge',
        'Category placement',
      ],
      cta: 'Apply Local',
      featured: false,
    },
    {
      name: 'State',
      desc: 'Statewide visibility.',
      slots: 'Limited availability',
      features: [
        'Statewide reach',
        'Priority placement',
        'Video-ready profile',
        'Verified badge',
      ],
      cta: 'Apply State',
      featured: true,
    },
    {
      name: 'National',
      desc: 'Full-network visibility.',
      slots: 'Very limited',
      features: [
        'National exposure',
        'Top-tier placement',
        'Video + map + social',
        'Verified badge',
      ],
      cta: 'Apply National',
      featured: false,
    },
  ];

  const features = [
    'Verified badge',
    'Video embed area',
    'Map and location display',
    'Social media links',
    'Agent reviews',
    'Category placement',
    'Powered by GetReadyToPost.com branding',
  ];

  const testimonials = [
    {
      quote: 'GetReadyToPost helped us get in front of agents looking for trusted vendors.',
      author: 'Sarah Mitchell',
      company: 'Premier Home Inspections',
      category: 'Home Inspector',
    },
    {
      quote: 'The profile visibility gave our title company a more professional presence.',
      author: 'James Rodriguez',
      company: 'Coastal Title & Escrow',
      category: 'Title Company',
    },
    {
      quote: 'This gave us a cleaner way to present our lending services to real estate professionals.',
      author: 'Emily Chen',
      company: 'NextGen Mortgage Solutions',
      category: 'Mortgage Lender',
    },
  ];

  const faqs = [
    {
      q: 'How does the approval process work?',
      a: 'Each vendor application is reviewed to maintain quality on the platform.',
    },
    {
      q: 'Can I include a video on my profile?',
      a: 'Yes. Your vendor profile includes a dedicated video area.',
    },
    {
      q: 'Are placements limited?',
      a: 'Yes. Placements are limited by market and tier to protect visibility.',
    },
    {
      q: 'Can I upgrade later?',
      a: 'Yes. Vendors can request upgraded placement based on availability.',
    },
    {
      q: 'Do I need to be verified?',
      a: 'Verification may be optional, but verified vendors present stronger trust signals.',
    },
    {
      q: 'How do agents find vendors?',
      a: 'Agents discover vendors through category placements and market-based exposure.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-blue-800 bg-slate-950/60 px-8 py-16 text-center shadow-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
            Vendor Advertising
          </p>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
            Reach Real Estate Agents Looking for Trusted Vendors
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-blue-100 md:text-xl">
            Put your business in front of agents and professionals across active markets.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#apply"
              className="rounded-xl bg-yellow-400 px-8 py-4 text-base font-bold text-slate-950 transition hover:bg-yellow-300"
            >
              Apply to Advertise
            </a>
            <a
              href="#listed"
              className="rounded-xl border border-yellow-400 px-8 py-4 text-base font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
            >
              Get Listed
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-900 bg-slate-900/70 px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-blue-800 bg-slate-950/40 p-6 text-center"
            >
              <div className="mb-2 text-3xl font-bold text-yellow-400 md:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm text-blue-100 md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Who Should Advertise
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-blue-100">
            Built for service providers who want visibility with real estate professionals.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vendorTypes.map((vendor) => (
              <div
                key={vendor.title}
                className="rounded-2xl border border-blue-800 bg-slate-950/50 p-8"
              >
                <div className="mb-4 text-4xl">{vendor.icon}</div>
                <h3 className="mb-3 text-2xl font-semibold">{vendor.title}</h3>
                <p className="leading-relaxed text-blue-100">{vendor.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-blue-800 bg-slate-950/50 p-8 text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-2xl font-bold text-slate-950">
                  {step.number}
                </div>
                <h3 className="mb-4 text-2xl font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-blue-100">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Ad Placement Options
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-blue-100">
            Choose the visibility level that fits your market strategy.
          </p>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.featured
                    ? 'border-2 border-yellow-400 bg-slate-950 shadow-xl'
                    : 'border border-blue-800 bg-slate-950/50'
                }`}
              >
                {tier.featured && (
                  <div className="mb-4 inline-block rounded-full bg-yellow-400 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                    Featured
                  </div>
                )}
                <h3 className="mb-2 text-2xl font-bold">{tier.name}</h3>
                <p className="mb-3 text-blue-100">{tier.desc}</p>
                <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-yellow-400">
                  {tier.slots}
                </p>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-blue-100">
                      <span className="mt-1 text-yellow-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#apply"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-yellow-300"
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-slate-900/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            What You Get
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-blue-100">
            Every approved vendor placement is designed to help you present professionally.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-blue-800 bg-slate-950/50 p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl text-yellow-400">✓</span>
                  <span className="text-lg text-blue-100">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            Why Collective Branding Works
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-blue-100">
            Watch how advertising together creates more visibility, more traffic, and more opportunities for every vendor.
          </p>
          <div className="rounded-3xl border border-2 border-yellow-400 bg-slate-950/50 p-6">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-blue-800 bg-slate-900">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/IcYjjjSgAGw"
                title="Collective Branding vs Single Branding"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="mt-4 text-center text-sm text-blue-200">
              <a
                href="https://youtu.be/IcYjjjSgAGw"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-yellow-400 hover:text-yellow-300"
              >
                Watch on YouTube →
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Testimonials
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="rounded-2xl border border-blue-800 bg-slate-950/50 p-8"
              >
                <p className="mb-6 text-lg leading-relaxed text-blue-100">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-blue-800 pt-4">
                  <p className="font-bold text-yellow-400">{testimonial.author}</p>
                  <p className="text-sm text-blue-200">{testimonial.company}</p>
                  <p className="text-xs uppercase tracking-wide text-blue-300">
                    {testimonial.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-blue-800 bg-slate-950/50 p-6"
              >
                <h3 className="mb-3 text-xl font-semibold text-yellow-400">
                  {faq.q}
                </h3>
                <p className="leading-relaxed text-blue-100">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-slate-900/60 px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-blue-800 bg-slate-950/60 px-8 py-16 text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Ready to Advertise Your Business?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100">
            Apply for placement and put your business in front of real estate professionals on GetReadyToPost.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#apply"
              className="rounded-xl bg-yellow-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-yellow-300"
            >
              Apply to Advertise
            </a>
            <Link
              href="/contact-broker"
              className="rounded-xl border border-yellow-400 px-8 py-4 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
            >
              Have Questions? Contact Us
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-blue-900 bg-slate-950 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-yellow-400">
                GetReadyToPost
              </h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/rate-my-listing">Rate My Listing</Link>
                </li>
                <li>
                  <Link href="/agent-vault">Agent Vault</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-yellow-400">
                For Vendors
              </h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <Link href="/advertise">Advertise</Link>
                </li>
                <li>
                  <a href="#apply">Apply Now</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-yellow-400">
                Company
              </h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <Link href="/how-it-works">How It Works</Link>
                </li>
                <li>
                  <Link href="/contact-broker">Contact</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-yellow-400">
                Connect
              </h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a
                    href="https://facebook.com/getreadytopost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/company/getreadytopost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/getreadytopost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="mailto:info@getreadytopost.com">Email</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-900 pt-8 text-center text-sm text-blue-300">
            <p className="mb-2">
              Powered by{' '}
              <span className="font-bold text-yellow-400">
                GetReadyToPost.com
              </span>
            </p>
            <p>&copy; 2026 GetReadyToPost. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
