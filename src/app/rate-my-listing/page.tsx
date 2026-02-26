"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
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
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState({
    address: '', city: '', state: '', zip: '', propertyType: '', beds: '', baths: '', sqft: '', lotSize: '', yearBuilt: '', price: '', features: '',
  });

  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  useEffect(() => {
    if (user?.uid) fetchCreditBalance();
  }, [user?.uid]);

  const fetchCreditBalance = async () => {
    if (!user?.uid) return;
    setCreditsLoading(true);
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert('Please sign in to submit a listing.');
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        userId: user.uid,
        email: email || user.email,
        listingText: listing,
        propertyDetails: showPropertyDetails ? propertyDetails : {},
        wordCount,
        status: 'pending_analysis',
        createdAt: new Date().toISOString(),
      });
      setSubmissionId(docRef.id);
      if (creditBalance > 0) {
        try {
          const deductRes = await fetch('/api/credits/deduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }),
          });
          const deductData = await deductRes.json();
          if (deductRes.ok) {
            setCreditBalance(deductData.newBalance || creditBalance - 1);
            await fetch('/api/submissions/run-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: docRef.id }),
            });
            router.push(`/results?id=${docRef.id}`);
          } else {
            alert('Error deducting credit. Please try again.');
          }
        } catch (error) {
          console.error('Error deducting credit:', error);
          alert('Error processing credit. Please try again.');
        }
      } else {
        setShowPayment(true);
      }
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
        <section className="py-8 text-center text-white">
          <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🔥 Instant Listing Analysis</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Rate My Listing</h1>
          <p className="text-gray-300 mb-4 text-lg">Grade → Rewrite → Report. All in one place.</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Instant AI-powered analysis</p>
          </div>
          {user && creditBalance > 0 && (
            <div className="mt-4 text-green-300 font-semibold">✨ You have {creditBalance} credit(s) available</div>
          )}
        </section>
        <section className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/cbfSoBk7hfI?rel=0&modestbranding=1&color=white" title="Are You On The Fence?" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
          </div>
        </section>
        <section className="mb-10">
          <Link href="/workspace" className="block bg-gradient-to-r from-[#c9a227]/20 to-amber-600/10 border-2 border-[#c9a227]/40 rounded-2xl p-6 hover:border-[#c9a227]/70 transition group">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔧</div>
              <div className="flex-1">
                <div className="text-[#c9a227] font-bold text-sm uppercase tracking-widest mb-1">Having trouble writing it?</div>
                <h3 className="text-white font-bold text-xl mb-1">Try the Agent Workspace</h3>
                <p className="text-gray-300 text-sm">Pull your property details, neighborhood data, features, and photos into one place.</p>
              </div>
              <div className="text-white/50 group-hover:text-[#c9a227] transition text-2xl">→</div>
            </div>
          </Link>
        </section>
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">How We Grade Your Listing</h2>
            <p className="text-gray-400">Your description is scored across 6 categories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingCategories.map((cat, i) => (
              <div key={i} className={`rounded-xl p-5 border ${cat.color} backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                    <p className="text-gray-300 text-sm">{cat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {showPayment ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Your Payment</h2>
            <div className="space-y-4 mb-6">
              <button onClick={handlePaymentClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Open Square Payment</button>
              <button onClick={handleViewResults} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold">✨ View My Results</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
            <h2 className="text-xl font-bold text-[#1a2b4a] mb-4 text-center">Paste Your Listing Below</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description *</label>
                <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Paste your listing description here..." rows={8} value={listing} onChange={(e) => setListing(e.target.value)} required />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Aim for 140–160 words</p>
                  <p className={`text-sm font-bold ${wordCount < 50 ? 'text-red-500' : wordCount < 140 ? 'text-amber-500' : 'text-green-500'}`}>{wordCount} words</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                <input type="checkbox" id="showDetails" checked={showPropertyDetails} onChange={(e) => setShowPropertyDetails(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="showDetails" className="text-sm font-medium text-gray-700">Add property details (optional)</label>
              </div>
              {showPropertyDetails && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="text" placeholder="Address" value={propertyDetails.address} onChange={(e) => setPropertyDetails({...propertyDetails, address: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="text" placeholder="City" value={propertyDetails.city} onChange={(e) => setPropertyDetails({...propertyDetails, city: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Beds" value={propertyDetails.beds} onChange={(e) => setPropertyDetails({...propertyDetails, beds: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Baths" value={propertyDetails.baths} onChange={(e) => setPropertyDetails({...propertyDetails, baths: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Sqft" value={propertyDetails.sqft} onChange={(e) => setPropertyDetails({...propertyDetails, sqft: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    <input type="text" placeholder="Year Built" value={propertyDetails.yearBuilt} onChange={(e) => setPropertyDetails({...propertyDetails, yearBuilt: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              )}
              <button onClick={handleSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50" disabled={!email || !listing || loading}>
                {loading ? 'Saving...' : '🔥 Continue to Analysis'}
              </button>
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
