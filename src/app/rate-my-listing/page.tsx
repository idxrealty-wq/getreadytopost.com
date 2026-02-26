"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const gradingCategories = [
  { icon: '🎣', title: 'Hook', description: 'Does your opening line stop a buyer mid-scroll?', color: 'bg-blue-500/20 border-blue-400/40' },
  { icon: '🏠', title: 'Features', description: 'Are your key property details highlighted?', color: 'bg-green-500/20 border-green-400/40' },
  { icon: '🌅', title: 'Lifestyle', description: 'Does it paint a picture of living there?', color: 'bg-purple-500/20 border-purple-400/40' },
  { icon: '⚖️', title: 'Compliance', description: 'Is your language Fair Housing safe?', color: 'bg-red-500/20 border-red-400/40' },
  { icon: '📖', title: 'Flow', description: 'Is it easy to read?', color: 'bg-amber-500/20 border-amber-400/40' },
  { icon: '📣', title: 'CTA', description: 'Does it drive a showing?', color: 'bg-pink-500/20 border-pink-400/40' },
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
  const [propertyDetails, setPropertyDetails] = useState({
    address: '', city: '', beds: '', baths: '', sqft: '', yearBuilt: '',
  });
  const [mapUrl, setMapUrl] = useState('');

  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  useEffect(() => {
    if (user?.uid) {
      (async () => {
        try {
          const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
          const data = await res.json();
          setCreditBalance(data.balance || 0);
        } catch (e) {
          console.error('Error:', e);
        }
      })();
    }
  }, [user?.uid]);

  const generateMapUrl = () => {
    const fullAddress = `${propertyDetails.address}, ${propertyDetails.city}`;
    const encoded = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyDummyKey&q=${encoded}`;
  };

  useEffect(() => {
    if (propertyDetails.address && propertyDetails.city) {
      setMapUrl(generateMapUrl());
    }
  }, [propertyDetails.address, propertyDetails.city]);

  const isFormValid = email && listing && propertyDetails.address && propertyDetails.city && propertyDetails.beds && propertyDetails.baths;

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert('Please sign in.');
      return;
    }
    if (!isFormValid) {
      alert('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'submissions'), {
        userId: user.uid,
        email: email || user.email,
        listingText: listing,
        propertyDetails,
        wordCount,
        status: 'pending_analysis',
        createdAt: new Date().toISOString(),
      });
      setSubmissionId(docRef.id);
      if (creditBalance > 0) {
        const deductRes = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }),
        });
        if (deductRes.ok) {
          setCreditBalance(cb => cb - 1);
          await fetch('/api/submissions/run-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: docRef.id }),
          });
          router.push(`/results?id=${docRef.id}`);
        }
      } else {
        setShowPayment(true);
      }
    } catch (e) {
      alert('Error. Try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png?w=1200&h=896" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white mb-10">
          <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🔥 Instant Listing Analysis</div>
          <h1 className="text-4xl font-bold mb-3">Rate My Listing</h1>
          <p className="text-gray-300 mb-4">Grade → Rewrite → Report.</p>
          <div className="bg-white/10 rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Instant AI analysis</p>
          </div>
          {user && creditBalance > 0 && <div className="mt-4 text-green-300 font-semibold">✨ {creditBalance} credit(s)</div>}
        </section>

        <section className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/cbfSoBk7hfI?rel=0&modestbranding=1&color=white" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
          </div>
        </section>

        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">How We Grade</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingCategories.map((cat, i) => (
              <div key={i} className={`rounded-xl p-5 border ${cat.color}`}>
                <p className="text-3xl mb-2">{cat.icon}</p>
                <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                <p className="text-gray-300 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {showPayment ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Complete Payment</h2>
            <button onClick={() => window.open('https://square.link/u/22tY4Rla', '_blank')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-3">Open Square Payment</button>
            <button onClick={() => router.push(`/results?id=${submissionId}`)} className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold">View Results</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#1a2b4a] mb-6 text-center">Submit Your Listing</h2>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {/* Property Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-700 mb-3">Property Details *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Address" value={propertyDetails.address} onChange={(e) => setPropertyDetails({...propertyDetails, address: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                  <input type="text" placeholder="City" value={propertyDetails.city} onChange={(e) => setPropertyDetails({...propertyDetails, city: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                  <input type="text" placeholder="Beds" value={propertyDetails.beds} onChange={(e) => setPropertyDetails({...propertyDetails, beds: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                  <input type="text" placeholder="Baths" value={propertyDetails.baths} onChange={(e) => setPropertyDetails({...propertyDetails, baths: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                  <input type="text" placeholder="Sqft" value={propertyDetails.sqft} onChange={(e) => setPropertyDetails({...propertyDetails, sqft: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                  <input type="text" placeholder="Year Built" value={propertyDetails.yearBuilt} onChange={(e) => setPropertyDetails({...propertyDetails, yearBuilt: e.target.value})} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#c9a227] focus:outline-none" />
                </div>
              </div>

              {/* Map */}
              {mapUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                  <iframe width="100%" height="100%" frameBorder="0" src={mapUrl} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              )}

              {/* Listing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing *</label>
                <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" placeholder="Paste listing here..." rows={8} value={listing} onChange={(e) => setListing(e.target.value)} />
                <p className={`text-sm font-bold mt-1 ${wordCount < 50 ? 'text-red-500' : wordCount < 140 ? 'text-amber-500' : 'text-green-500'}`}>{wordCount} words</p>
              </div>

              {/* Submit */}
              <button onClick={handleSubmit} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition disabled:opacity-50" disabled={!isFormValid || loading}>
                {loading ? 'Saving...' : '🔥 Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
