import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              GetReadyToPost
            </Link>
            <div className="hidden md:flex gap-8">
              <Link href="/rate-my-listing" className="text-gray-700 hover:text-blue-600">🔥 Rate My Listing</Link>
              <Link href="/agents" className="text-gray-700 hover:text-blue-600">Agents</Link>
              <Link href="/brokers" className="text-gray-700 hover:text-blue-600">Brokers</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-600">FAQ</Link>
              <Link href="/upload-new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit Listing</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Your Photos Get the Click.</h1>
          <h2 className="text-4xl font-bold text-blue-600 mb-6">Your Words Get the Showing.</h2>
          <p className="text-lg text-gray-700 mb-8">
            A listing description isn't "extra" — it's the copy that follows your property everywhere: MLS, Zillow, Realtor.com, Facebook, email blasts, and your agent website.
          </p>
          <Link href="/upload-new" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700">
            Submit Your Listing
          </Link>
          <Link href="/get-why-copy-matters" className="ml-4 inline-block text-blue-600 hover:underline font-bold">
            Why Copy Matters →
          </Link>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xl italic text-gray-600 mb-4">
            "Sound Familiar?"
          </p>
          <p className="text-center text-2xl font-bold mb-2">
            "I've been staring at this listing description for an hour..."
          </p>
          <p className="text-center text-gray-600 mb-8">
            — Every agent at 11pm before a listing goes live
          </p>
          <div className="border-l-4 border-blue-600 pl-6">
            <p className="text-lg italic text-gray-700">
              "A real estate listing description tells a home's story and provides the buyer with insight about what it's like to live there."
            </p>
            <p className="text-right font-bold text-gray-800 mt-2">
              — Tyler Nicely, Realtor
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">There's a Better Way</h2>
          <h3 className="text-2xl font-bold text-center mb-12">MLS Listing Descriptions That Sell</h3>
          <p className="text-center text-gray-700 mb-12">
            Residential. Commercial. Vacant Land. We write professional real estate copy for agents who want to close faster.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-bold mb-3">Upload Your Listing</h4>
              <p className="text-gray-700">
                Paste your current description (or rough notes) into our simple form. We handle the rest.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold mb-3">We Polish & Rewrite</h4>
              <p className="text-gray-700">
                Our copywriters craft buyer-focused, MLS-ready descriptions that highlight what makes your property special.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold mb-3">Delivered in 24 Hours</h4>
              <p className="text-gray-700">
                Get plain text and formatted versions. Paste directly into your MLS, Zillow, or marketing materials.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/upload-new" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
              Submit Your Listing Now
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">See How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-5xl font-bold mb-2">87%</p>
              <p className="text-lg">of buyers consider listing descriptions "extremely important or very important"</p>
              <p className="text-sm mt-2">— Redfin/Grammarly Study</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Real Estate Agents Choose GetReadyToPost</h2>
          <p className="text-center text-gray-700 mb-12">
            We specialize in MLS listing copywriting — it's all we do. That focus means better results for your listings.
          </p>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">24hr</p>
              <p className="text-gray-700">Standard Turnaround</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">$79</p>
              <p className="text-gray-700">Starting Price</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">1 Free</p>
              <p className="text-gray-700">Revision Included</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">100%</p>
              <p className="text-gray-700">MLS Compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Listing Description Add-Ons</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-3">Editor Notes</h3>
              <p className="text-gray-700 mb-4">
                Get detailed feedback on your original listing — what works, what doesn't, and why.
              </p>
              <p className="text-2xl font-bold text-blue-600">$29</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-3">Headline Pack</h3>
              <p className="text-gray-700 mb-4">
                Get 5 alternative headlines optimized for MLS, Zillow, and social media.
              </p>
              <p className="text-2xl font-bold text-blue-600">$19</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-3">Caption Pack</h3>
              <p className="text-gray-700 mb-4">
                Get 5 captions for social media posts (Instagram, Facebook, email).
              </p>
              <p className="text-2xl font-bold text-blue-600">$29</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-blue-600 font-bold hover:underline">
              View Full Pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl italic text-gray-700 mb-4">
            "You're not just selling a house—you're selling a home and the experience of living in it."
          </p>
          <p className="text-gray-600">— Perry Real Estate College</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Write Better MLS Listings?</h2>
          <p className="text-lg mb-8">
            Join agents and brokers who are selling faster with polished, buyer-focused descriptions.
          </p>
          <Link href="/upload-new" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100">
            Submit Your First Listing
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link href="/agents" className="hover:text-blue-400">For Agents</Link></li>
                <li><Link href="/brokers" className="hover:text-blue-400">For Brokers</Link></li>
                <li><Link href="/fsbo" className="hover:text-blue-400">For FSBO</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/examples" className="hover:text-blue-400">Examples</Link></li>
                <li><Link href="/faq" className="hover:text-blue-400">FAQ</Link></li>
                <li><Link href="/agent-vault" className="hover:text-blue-400">Agent Vault</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Get Started</h4>
              <p className="text-sm mb-4">Ready to transform your listings? Submit your first description today.</p>
              <Link href="/upload-new" className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                Submit Listing
              </Link>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2">
                <li><a href="https://www.facebook.com/getreadytopost" className="hover:text-blue-400">Facebook</a></li>
                <li><a href="https://www.linkedin.com/company/getreadytopost" className="hover:text-blue-400">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>©2026 GetReadyToPost.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
