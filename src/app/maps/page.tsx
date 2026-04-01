// src/app/maps/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agent Property Maps | GetReadyToPost.com",
  description:
    "Interactive property maps for real estate agents. Plot your active listings, pending sales, and sold properties with video walkthroughs. Powered by GetReadyToPost.com.",
  robots: { index: true, follow: true },
};

const FEATURES = [
  {
    icon: "📍",
    title: "Color-Coded Pins",
    description:
      "Active, pending, and sold listings displayed instantly on a live Google Map.",
  },
  {
    icon: "🎥",
    title: "Video Walkthroughs",
    description:
      "Attach video tours directly to property pins. Buyers watch before they visit.",
  },
  {
    icon: "🔍",
    title: "Smart Filters",
    description:
      "Filter by status, price range, beds, baths, and video availability in real time.",
  },
  {
    icon: "📤",
    title: "Shareable Map Page",
    description:
      "Every agent gets a unique map URL to share with clients, on social media, or embed on their website.",
  },
  {
    icon: "🏆",
    title: "Sold Proof",
    description:
      "Showcase your track record. Sold pins with final price build instant credibility.",
  },
  {
    icon: "⚡",
    title: "Always Current",
    description:
      "Your map updates automatically as listings change status in your Vault.",
  },
];

export default function MapsIndexPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa]">

      {/* Hero */}
      <section className="bg-[#0a2342] text-white py-20 px-6 text-center">
        <p className="text-[#c8a84b] text-sm font-semibold uppercase tracking-widest mb-3">
          New Feature
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Your Listings. On the Map.
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          Give every client a live, interactive map of your active listings,
          pending sales, and sold properties — with video walkthroughs attached
          to every pin.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/maps/agent-demo"
            className="bg-[#c8a84b] hover:bg-[#b8973a] text-[#0a2342] font-bold px-8 py-3 rounded-xl text-base transition-colors"
          >
            View Live Demo Map
          </Link>
          <Link
            href="/register"
            className="border border-white text-white hover:bg-white hover:text-[#0a2342] font-semibold px-8 py-3 rounded-xl text-base transition-colors"
          >
            Get Your Map
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0a2342] text-center mb-12">
          Everything Agents Need on One Map
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-[#0a2342] text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-[#0a2342] text-white py-14 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Put Your Listings on the Map?
        </h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Included with all GetReadyToPost membership plans. No extra setup required.
        </p>
        <Link
          href="/maps/agent-demo"
          className="bg-[#c8a84b] hover:bg-[#b8973a] text-[#0a2342] font-bold px-10 py-3 rounded-xl text-base transition-colors"
        >
          See the Demo
        </Link>
      </section>

      {/* Footer note */}
      <div className="text-center py-6 text-xs text-gray-400">
        Powered by GetReadyToPost.com &mdash; MLS-Compliant Agent Tools
      </div>
    </main>
  );
}
