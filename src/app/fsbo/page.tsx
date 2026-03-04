import Link from 'next/link';

export default function FSBOPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="bg-[#c9a227] text-white text-sm font-bold px-4 py-1 rounded-full mb-4 inline-block">FOR SALE BY OWNER</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">FSBO Listing Analysis</h1>
          <p className="text-xl text-gray-300">Compete with agent listings - without paying commission</p>
        </div>
      </section>
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <img alt="FSBO Listing Rewrite" className="w-full rounded-xl shadow-lg" src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/71921e23-902b-42e5-ac09-bc8d3f7a32c3/IMG_2019.png" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">What We Do</h2>
              <p className="text-gray-600 mb-4">We analyze and polish FSBO listings so they read professional, buyer-friendly, and competitive with agent listings.</p>
              <p className="text-gray-600 mb-6">Many FSBOs struggle with generic language or missing key details - our AI-powered system fixes that instantly.</p>
              <div className="bg-[#faf8f5] rounded-xl p-6">
                <p className="text-4xl font-bold text-[#c9a227] mb-2">$19.99</p>
                <p className="text-gray-600 mb-4">Instant analysis and professional rewrite</p>
                <Link href="/rate-my-listing" className="block bg-[#c9a227] hover:bg-[#e8c547] text-white py-3 rounded-lg font-semibold text-center">Get Started Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6 text-center">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Instant AI-powered grade (A-F scale, 6 categories)</span>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Professional rewrite (buyer-focused, paste-ready)</span>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Safe Paste version (for Zillow, Realtor.com, Facebook)</span>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Pretty version (formatted for easy reading)</span>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Full report with actionable recommendations</span>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded-lg shadow">
              <div className="w-6 h-6 bg-[#c9a227] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-[#1a2b4a]">Delivered instantly to your email</span>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Why FSBO Sellers Choose Us</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">You are already saving thousands by selling yourself. Do not let a weak listing description cost you buyers. For less than the price of a yard sign, get professional copy that competes with agent listings.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#faf8f5] p-6 rounded-xl">
              <p className="text-3xl font-bold text-[#c9a227] mb-2">$19.99</p>
              <p className="text-gray-600 text-sm">vs. 6% commission</p>
            </div>
            <div className="bg-[#faf8f5] p-6 rounded-xl">
              <p className="text-3xl font-bold text-[#c9a227] mb-2">Instant</p>
              <p className="text-gray-600 text-sm">No waiting for callbacks</p>
            </div>
            <div className="bg-[#faf8f5] p-6 rounded-xl">
              <p className="text-3xl font-bold text-[#c9a227] mb-2">Pro Quality</p>
              <p className="text-gray-600 text-sm">MLS-ready copy</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Submit Your FSBO Listing?</h2>
          <p className="text-gray-300 mb-8">Get professional copy that helps you sell faster - for just $19.99</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Get Started Now</Link>
        </div>
      </section>
    </main>
  );
}
