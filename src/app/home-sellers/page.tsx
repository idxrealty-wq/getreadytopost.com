import Link from 'next/link';

export const metadata = {
  title: 'Grade Your Home Listing Free | GetReadyToPost',
  description: 'Get an instant AI grade of your listing across 6 categories. Professional rewrite + recommendations. MLS-compliant, Fair Housing safe.',
  openGraph: {
    title: 'Grade Your Home Listing Free | GetReadyToPost',
    description: 'Get an instant AI grade of your listing across 6 categories. Professional rewrite + recommendations. MLS-compliant, Fair Housing safe.',
    url: 'https://getreadytopost.com/home-sellers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grade Your Home Listing Free | GetReadyToPost',
    description: 'Get an instant AI grade of your listing across 6 categories. Professional rewrite + recommendations. MLS-compliant, Fair Housing safe.',
  },
};

export default function HomeSellersPage() {
  return (
    <main 
      className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/home-sellers-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Is Your Home Listed?</h1>
          <p className="text-2xl text-gray-200 mb-8">Would you like to see a grade of your listing?</p>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">Get instant, professional feedback on how your listing appears to buyers. Our AI-powered analysis grades your listing across 6 critical categories and shows you exactly what to improve.</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg mb-8">Grade My Listing</Link>
        </div>
        <div className="mb-16 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe className="absolute top-0 left-0 w-full h-full" src="https://www.youtube.com/embed/NJWcpVAYuqM?rel=0" title="Is Your Listing Costing You Money? Grade It in 30 Seconds" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What You'll Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">6-Category Grade</h3>
                  <p className="text-gray-300">Your listing scored on Title, Description, Photos, Keywords, Compliance, and Impact.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Instant Feedback</h3>
                  <p className="text-gray-300">See exactly what's working and what needs improvement in your listing copy.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Professional Rewrite</h3>
                  <p className="text-gray-300">Get a complete rewrite of your listing description optimized for buyers.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Actionable Recommendations</h3>
                  <p className="text-gray-300">Specific, step-by-step guidance to improve your listing's appeal.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">MLS Compliant</h3>
                  <p className="text-gray-300">All recommendations follow Fair Housing and MLS guidelines.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-[#c9a227] text-2xl font-bold">✓</div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Instant Results</h3>
                  <p className="text-gray-300">Grade and rewrite delivered immediately. No waiting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-12 mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Grade Your Listing</h2>
            <p className="text-gray-300 mb-6">Get instant feedback and a professional rewrite for just</p>
            <p className="text-5xl font-bold text-[#c9a227] mb-6">$19.99</p>
            <p className="text-gray-300 mb-8">One-time payment. Instant results. No subscription.</p>
          </div>
          <p className="text-gray-300 mb-6">Ready to see how your listing stacks up?</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">Get Your Grade Now</Link>
        </div>
      </div>
    </main>
  );
}
