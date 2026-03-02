'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useUser } from '@/contexts/UserContext';
import { collection, addDoc } from 'firebase/firestore';

const gradingCategories = [
  { icon: '🎣', title: 'Hook', description: 'Does your opening line stop a buyer mid-scroll? The first sentence is everything.', color: 'bg-blue-500/20 border-blue-400/40' },
  { icon: '🏠', title: 'Features', description: 'Are your key property details highlighted in a way that excites — not just informs?', color: 'bg-green-500/20 border-green-400/40' },
  { icon: '🌅', title: 'Lifestyle', description: 'Does your description paint a picture of what it feels like to actually live there?', color: 'bg-purple-500/20 border-purple-400/40' },
  { icon: '⚖️', title: 'Compliance', description: 'Is your language Fair Housing compliant and MLS-safe? One wrong word can cost you.', color: 'bg-red-500/20 border-red-400/40' },
  { icon: '📖', title: 'Flow', description: 'Is it easy to read? Short sentences, active voice, no walls of text.', color: 'bg-amber-500/20 border-amber-400/40' },
  { icon: '📣', title: 'Call to Action', description: 'Does it drive the buyer to schedule a showing — or just describe a house?', color: 'bg-pink-500/20 border-pink-400/40' },
];

export default function RateMyListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('FL');
  const [zip, setZip] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [price, setPrice] = useState('');

  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  const saveToLocalStorage = () => {
    const propertyData = {
      address, city, state, zip,
      beds, baths, sqft, yearBuilt, price,
      email,
      fullAddress: `${address}, ${city}, ${state} ${zip}`.trim(),
    };
    localStorage.setItem('grtp_property', JSON.stringify(propertyData));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      saveToLocalStorage();
      const propertyDetails = {
        address, city, state, zip,
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseFloat(baths) : null,
        sqft: sqft ? parseInt(sqft) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        price: price ? parseFloat(price) : null,
      };
      const docRef = await addDoc(collection(db, 'submissions'), {
        email,
        listingText: listing,
        wordCount,
        propertyDetails,
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
      });
      setSubmissionId(docRef.id);
      if (user?.uid) {
        try {
          const creditRes = await fetch('/api/credits/balance?userId=' + user.uid);
          const creditData = await creditRes.json();
          if (creditData.balance > 0) {
            await fetch('/api/credits/deduct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }),
            });
            await fetch('/api/submissions/run-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: docRef.id }),
            });
            router.push('/results?id=' + docRef.id);
            return;
          }
        } catch(e) { console.error('Credit check failed', e); }
      }
      setShowPayment(true);
    } catch (error) {
      alert('Error saving submission. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    window.open('https://square.link/u/22tY4Rla', '_blank');
  };

  const handleViewResults = () => {
    router.push(`/results?id=${submissionId}`);
  };
  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png?w=1200&h=896" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="py-8 text-center text-white">
          <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🔥 Instant Listing Analysis</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Rate My Listing</h1>
          <p className="text-gray-300 mb-4 text-lg">Grade → Rewrite → Report. All in one place.</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Instant AI-powered analysis</p>
          </div>
        </section>

        {/* Video */}
        <section className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/cbfSoBk7hfI?rel=0&modestbranding=1&color=white"
              title="Are You On The Fence? Your Listing Description Is Costing You Money"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </section>

        {/* Agent Workspace Callout */}
        <section className="mb-10">
          <Link href="/workspace" className="block bg-gradient-to-r from-[#c9a227]/20 to-amber-600/10 border-2 border-[#c9a227]/40 rounded-2xl p-6 hover:border-[#c9a227]/70 transition group">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔧</div>
              <div className="flex-1">
                <div className="text-[#c9a227] font-bold text-sm uppercase tracking-widest mb-1">Having trouble writing it?</div>
                <h3 className="text-white font-bold text-xl mb-1">Try the Agent Workspace</h3>
                <p className="text-gray-300 text-sm">Pull your property details, neighborhood data, features, and photos into one place. No more blank screen — everything you need to write a great listing is right there waiting for you.</p>
              </div>
              <div className="text-white/50 group-hover:text-[#c9a227] transition text-2xl">→</div>
            </div>
          </Link>
        </section>

        {/* Grading Criteria */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">How We Grade Your Listing</h2>
            <p className="text-gray-400">Your description is scored across 6 categories. Here is what we look for:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingCategories.map((cat, i) => (
              <div key={i} className={`rounded-xl p-5 border ${cat.color} backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">Each category is scored 1–10. Your total score determines your listing grade — and exactly what needs to be fixed.</p>
          </div>
        </section>

        {/* Form or Payment */}
        {showPayment ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">Complete these 2 steps:</p>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#c9a227] text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="font-bold text-gray-800">Pay $19.99 via Square</h3>
                </div>
                <button onClick={handlePaymentClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
                  Open Square Payment
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="font-bold text-gray-800">View Your Results</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">After completing payment, click below to see your instant analysis</p>
                <button onClick={handleViewResults} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition">
                  ✨ View My Results
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Your results will appear instantly after payment is processed (usually 30-60 seconds)</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-[#1a2b4a] mb-4 text-center">📋 Paste Your Listing Below</h2>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your report will be sent here</p>
              </div>

              {/* Property Details */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">Property Details <span className="text-gray-400 font-normal">(helps AI grade more accurately)</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="FL"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="List Price ($)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Beds"
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Baths"
                    type="number"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Sqft"
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                    placeholder="Year Built"
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                  />
                </div>
              </div>

              {/* Listing Description */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description *</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                  placeholder="Paste your MLS listing description here... The more detail you include, the better your grade and rewrite will be."
                  rows={8}
                  value={listing}
                  onChange={(e) => setListing(e.target.value)}
                  required
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Aim for 140–160 words for best results</p>
                  <p className={`text-sm font-bold ${wordCount < 50 ? 'text-red-500' : wordCount < 140 ? 'text-amber-500' : 'text-green-500'}`}>{wordCount} words</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
                disabled={!email || !listing || loading}
              >
                {loading ? '⏳ Checking...' : '🔥 Continue to Payment'}
              </button>
              <p className="text-xs text-gray-500 text-center">Secure payment via Square. See results instantly.</p>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
