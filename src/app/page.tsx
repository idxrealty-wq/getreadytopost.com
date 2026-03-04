import ShareButtons from '@/components/ShareButtons';
import Link from 'next/link';

export const metadata = {
  title: 'GetReadyToPost - AI-Powered MLS Listing Rewrites',
  description: 'Grade your listing across 6 categories. Get instant AI feedback, professional rewrites, and actionable recommendations. MLS-compliant, Fair Housing safe.',
  openGraph: {
    title: 'GetReadyToPost - AI-Powered MLS Listing Rewrites',
    description: 'Grade your listing across 6 categories. Get instant AI feedback, professional rewrites, and actionable recommendations.',
    url: 'https://getreadytopost.com',
    type: 'website',
    image: '/og-home.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetReadyToPost - AI-Powered MLS Listing Rewrites',
    description: 'Grade your listing across 6 categories. Get instant AI feedback, professional rewrites, and actionable recommendations.',
    image: '/og-home.png',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat pt-32 pb-16"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative max-w-4xl mx-auto px-6">
          <ShareButtons
            url="https://getreadytopost.com"
            title="GetReadyToPost - AI-Powered Listing Rewrites"
          />
          <div className="text-center mb-16 mt-8">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">Your Photos Get The Click.</h1>
            <p className="text-2xl text-black mb-8">Your Words Get The Showing.</p>
            <p className="text-lg text-black mb-12 max-w-2xl mx-auto">Most listing descriptions are invisible to buyers. Ours are not. GetReadyToPost grades your listing across 6 critical categories and shows you exactly what to improve.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/closing-costs" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">
                Closing Cost Calculator
              </Link>
              <Link href="/how-it-works" className="inline-block bg-white hover:bg-gray-100 text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg border-2 border-[#1a2b4a]">
                How It Works
              </Link>
            </div>
          </div>
          <div className="mb-16 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/NJWcpVAYuqM?rel=0"
                title="GetReadyToPost - Grade Your Listing in 30 Seconds"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-3xl font-bold text-black mb-4">New: Closing Cost Calculator (Orange County, FL)</h2>
            <p className="text-lg text-gray-700 mb-8">
              Buyer cash-to-close + seller net proceeds, with itemized breakdowns and accurate Orange County rules.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/closing-costs" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-10 py-4 rounded-lg font-bold text-lg transition shadow-lg">
                Open Calculator
              </Link>
              <Link href="/contact-broker" className="inline-block bg-white hover:bg-gray-100 text-[#1a2b4a] px-10 py-4 rounded-lg font-bold text-lg transition shadow-lg border-2 border-[#1a2b4a]">
                Get Early Access
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">How It Works</h2>
            <p className="text-xl text-gray-700">Three steps to a better listing.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#c9a227] mb-4">1</div>
              <h3 className="text-2xl font-bold text-black mb-4">Paste Your Listing</h3>
              <p className="text-gray-700">Copy your MLS description and paste it into our tool. Takes 30 seconds.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#c9a227] mb-4">2</div>
              <h3 className="text-2xl font-bold text-black mb-4">Get Your Grade</h3>
              <p className="text-gray-700">Instant AI feedback across 6 categories: Title, Description, Keywords, Emotion, CTA, Compliance.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#c9a227] mb-4">3</div>
              <h3 className="text-2xl font-bold text-black mb-4">Get Your Rewrite</h3>
              <p className="text-gray-700">Professional rewrite + actionable recommendations. Use it immediately or refine further.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">Why It Works</h2>
            <p className="text-xl text-gray-700">Built for real estate professionals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-black mb-4">MLS Compliant</h3>
              <p className="text-gray-700">All rewrites follow Fair Housing guidelines and NAR best practices. No prohibited language. Ever.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-black mb-4">Buyer Psychology</h3>
              <p className="text-gray-700">Descriptions optimized for how buyers actually search and read. Keywords, emotion, urgency - all balanced.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-black mb-4">Instant Results</h3>
              <p className="text-gray-700">Grade and rewrite in seconds. No waiting. No back-and-forth. Ready to use immediately.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-black mb-4">Actionable Feedback</h3>
              <p className="text-gray-700">Not just a grade - specific, step-by-step recommendations on what to improve and why.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-[#1a2b4a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Grade Your Listing?</h2>
          <p className="text-xl text-gray-300 mb-12">See what buyers see. Get actionable feedback in 30 seconds.</p>
          <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg">
            Grade My Listing Free
          </Link>
        </div>
      </section>
      <ShareButtons
        url="https://getreadytopost.com"
        title="GetReadyToPost - AI-Powered Listing Rewrites"
      />
    </main>
  );
}