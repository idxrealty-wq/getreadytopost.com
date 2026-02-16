import Link from 'next/link';

export default function PricingPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-300">One flat rate. Any listing length. Instant results.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="max-w-lg mx-auto bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] rounded-2xl p-10 text-white text-center shadow-2xl mb-12">
            <div className="bg-[#c9a227] text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-6">INSTANT DELIVERY</div>
            <p className="text-7xl font-bold text-[#c9a227] mb-4">$19.99</p>
            <p className="text-2xl mb-8">Per Listing Analysis</p>
            <ul className="text-left space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Instant AI-powered analysis & grade</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Professional MLS-ready rewrite</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Full report with visual scoring</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Safe Paste & Pretty versions included</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Delivered instantly to your email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">✓</span>
                <span className="text-lg">Works for ANY word count</span>
              </li>
            </ul>
            <Link href="/rate-my-listing" className="block bg-[#c9a227] hover:bg-[#e8c547] text-white py-4 rounded-xl font-bold text-xl transition">Get Started Now</Link>
          </div>

          <div className="bg-[#faf8f5] rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#c9a227] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-bold text-[#1a2b4a] mb-2">Submit Your Listing</h3>
                <p className="text-gray-600 text-sm">Paste your current listing description into the Rate My Listing tool</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#c9a227] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-bold text-[#1a2b4a] mb-2">Pay $19.99</h3>
                <p className="text-gray-600 text-sm">One-time payment. Secure checkout. No subscriptions.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#c9a227] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-bold text-[#1a2b4a] mb-2">Get Your Report</h3>
                <p className="text-gray-600 text-sm">Instant email delivery with grade, rewrite, and recommendations</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#c9a227] rounded-xl p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4 text-center">Why One Flat Rate?</h2>
            <p className="text-gray-600 text-center mb-6 max-w-2xl mx-auto">We believe great listing copy should be accessible to every agent, regardless of listing length. Whether you have 50 words or 500, you get the same quality analysis and rewrite.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-2xl">💰</span>
                <div>
                  <h3 className="font-bold text-[#1a2b4a] mb-1">No Hidden Fees</h3>
                  <p className="text-gray-600 text-sm">What you see is what you pay. No surprises.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-2xl">⚡</span>
                <div>
                  <h3 className="font-bold text-[#1a2b4a] mb-1">Instant Results</h3>
                  <p className="text-gray-600 text-sm">No waiting. Your report arrives in seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-2xl">🎯</span>
                <div>
                  <h3 className="font-bold text-[#1a2b4a] mb-1">Fair for Everyone</h3>
                  <p className="text-gray-600 text-sm">Same price whether you're listing a condo or an estate.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-2xl">🚀</span>
                <div>
                  <h3 className="font-bold text-[#1a2b4a] mb-1">Fully Automated</h3>
                  <p className="text-gray-600 text-sm">AI-powered system delivers professional results instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#1a2b4a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Listings?</h2>
          <p className="text-gray-300 mb-8">Get instant analysis and professional rewrites for just $19.99</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-8 py-4 rounded-lg font-semibold text-lg">Try Rate My Listing</Link>
        </div>
      </section>
    </main>
  );
}
