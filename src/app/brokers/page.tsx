import Link from 'next/link';

export default function BrokersPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#c9a227] to-[#e8c547] text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[#1a2b4a] font-semibold mb-4 uppercase tracking-wide">For Brokerages & Teams</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1a2b4a]">Consistent Quality Across Every Listing</h1>
          <p className="text-xl text-[#1a2b4a]/80 mb-8">Give your agents a competitive edge with professional copywriting support.</p>
          <Link href="/contact-broker" className="inline-block bg-[#1a2b4a] hover:bg-[#0f1a2e] text-white px-8 py-4 rounded-lg font-semibold text-lg">Contact for Broker Pricing</Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1a2b4a] mb-12">The Broker Advantage</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#faf8f5] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-3">Volume Pricing</h3>
              <p className="text-gray-600">Bulk credits and discounted rates for brokerages with multiple agents and listings.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-3">Brand Consistency</h3>
              <p className="text-gray-600">Every listing from your brokerage maintains the same professional quality and tone.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-3">Priority Queue</h3>
              <p className="text-gray-600">Broker program members get priority processing and dedicated support.</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#1a2b4a] mb-3">Agent Enablement</h3>
              <p className="text-gray-600">Help your agents focus on selling while we handle the writing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-[#1a2b4a] mb-6">All Property Types Covered</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Single Family</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Condos</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Townhomes</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Vacant Land</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Commercial</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Multi-Family</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Luxury</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">New Construction</span>
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-[#1a2b4a] border border-gray-200">Investment Properties</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Broker Program Benefits</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Custom SLA agreements based on volume</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Bulk credit packages at discounted rates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Queue priority for faster turnaround</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Add-ons: Editor Notes, headline packs, press releases</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Dedicated account support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span>Consistent brand voice across all listings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#1a2b4a] mb-4">Let's Talk</h2>
          <p className="text-gray-600 mb-8">Contact us to discuss custom pricing for your brokerage.</p>
          <Link href="/contact-broker" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Get in Touch</Link>
        </div>
      </section>
    </main>
  );
}
