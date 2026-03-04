'use client';
import { checkMissingInfo } from "./missing-info-checker";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useUser } from '@/contexts/UserContext';
import { collection, addDoc } from 'firebase/firestore';
import AddressAutosuggest from '@/components/AddressAutosuggest';

const formatDollar = (val: string) => {
  const v = val.replace(/[^0-9.]/g, '');
  return v ? '$' + Number(v).toLocaleString() : '';
};

export default function RateMyListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [missingInfo, setMissingInfo] = useState<{ missingFields: string[]; percentToA: number; suggestions: string[] }>({ missingFields: [], percentToA: 0, suggestions: [] });
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
  const [hoa, setHoa] = useState('');
  const [hoaAmount, setHoaAmount] = useState('');
  const [parcelLoaded, setParcelLoaded] = useState(false);
  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  const rerunChecker = (text: string, ov?: any) => {
    setMissingInfo(checkMissingInfo(text, {
      beds: ov?.beds ?? beds, baths: ov?.baths ?? baths, sqft: ov?.sqft ?? sqft,
      yearBuilt: ov?.yearBuilt ?? yearBuilt, price: ov?.price ?? price,
      hoa: ov?.hoa ?? hoa, hoaAmount: ov?.hoaAmount ?? hoaAmount,
    }));
  };

  const handleParcelSelect = (parcel: any) => {
    if (parcel.address) setAddress(parcel.address + ', ' + parcel.city + ', FL ' + parcel.zip);
    if (parcel.city) setCity(parcel.city);
    if (parcel.zip) setZip(parcel.zip);
    if (parcel.beds) setBeds(parcel.beds);
    if (parcel.baths) setBaths(parcel.baths);
    if (parcel.sqft) setSqft(parcel.sqft);
    if (parcel.year_built) setYearBuilt(parcel.year_built);
    setState('FL');
    setParcelLoaded(true);
    rerunChecker(listing, { beds: parcel.beds || beds, baths: parcel.baths || baths, sqft: parcel.sqft || sqft, yearBuilt: parcel.year_built || yearBuilt });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      localStorage.setItem('grtp_property', JSON.stringify({ address, city, state, zip, beds, baths, sqft, yearBuilt, price, hoa, hoaAmount, email }));
      const pd = { address, city, state, zip, beds: beds ? parseInt(beds) : null, baths: baths ? parseFloat(baths) : null, sqft: sqft ? parseInt(sqft) : null, yearBuilt: yearBuilt ? parseInt(yearBuilt) : null, price: price || null, hoa: hoa || null, hoaAmount: hoaAmount || null };
      const docRef = await addDoc(collection(db, 'submissions'), { email, listingText: listing, wordCount, propertyDetails: pd, status: 'pending_payment', createdAt: new Date().toISOString() });
      setSubmissionId(docRef.id);
      if (user?.uid) {
        try {
          const cr = await fetch('/api/credits/balance?userId=' + user.uid);
          const cd = await cr.json();
          if (cd.balance > 0) {
            await fetch('/api/credits/deduct', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }) });
            await fetch('/api/submissions/run-analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId: docRef.id }) });
            router.push('/results?id=' + docRef.id);
            return;
          }
        } catch(e) { console.error('Credit check failed', e); }
      }
      setShowPayment(true);
    } catch (error) {
      alert('Error saving submission. Please try again.');
      console.error(error);
    } finally { setLoading(false); }
  };

  const handlePaymentClick = () => { window.open('https://square.link/u/22tY4Rla', '_blank'); };
  const handleViewResults = () => { router.push('/results?id=' + submissionId); };
  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white">
          <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">Instant Listing Analysis</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Rate My Listing</h1>
          <p className="text-gray-300 mb-4 text-lg">Grade - Rewrite - Report. All in one place.</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Instant AI-powered analysis</p>
          </div>
        </section>
        <section className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/cbfSoBk7hfI?rel=0&modestbranding=1&color=white" title="Rate My Listing" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
          </div>
        </section>
        <section className="mb-10">
          <Link href="/workspace" className="block bg-gradient-to-r from-[#c9a227]/20 to-amber-600/10 border-2 border-[#c9a227]/40 rounded-2xl p-6 hover:border-[#c9a227]/70 transition group">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔧</div>
              <div className="flex-1">
                <div className="text-[#c9a227] font-bold text-sm uppercase tracking-widest mb-1">Having trouble writing it?</div>
                <h3 className="text-white font-bold text-xl mb-1">Try the Agent Workspace</h3>
                <p className="text-gray-300 text-sm">Pull property details, neighborhood data, and features into one place.</p>
              </div>
            </div>
          </Link>
        </section>
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Submit Your Listing</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a227]" required />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Property Address (Orange County, FL)</label>
              <AddressAutosuggest value={address} onChange={setAddress} onSelect={handleParcelSelect} />
            </div>
            {parcelLoaded && (
              <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                <p className="text-green-400 font-semibold text-sm mb-3">Auto-filled from county records — please verify and correct if needed:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-gray-400 text-xs mb-1">Beds</label><input type="number" value={beds} onChange={e => { setBeds(e.target.value); rerunChecker(listing, { beds: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" /></div>
                  <div><label className="block text-gray-400 text-xs mb-1">Baths</label><input type="number" value={baths} onChange={e => { setBaths(e.target.value); rerunChecker(listing, { baths: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" /></div>
                  <div><label className="block text-gray-400 text-xs mb-1">Sqft</label><input type="number" value={sqft} onChange={e => { setSqft(e.target.value); rerunChecker(listing, { sqft: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" /></div>
                  <div><label className="block text-gray-400 text-xs mb-1">Year Built</label><input type="number" value={yearBuilt} onChange={e => { setYearBuilt(e.target.value); rerunChecker(listing, { yearBuilt: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="block text-gray-400 text-xs mb-1">List Price</label><input type="text" value={price} onChange={e => { const v = formatDollar(e.target.value); setPrice(v); rerunChecker(listing, { price: v }); }} placeholder="$569,900" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500" /></div>
                  <div><label className="block text-gray-400 text-xs mb-1">HOA</label>
                    <select value={hoa} onChange={e => { setHoa(e.target.value); rerunChecker(listing, { hoa: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="" className="bg-gray-800">Select...</option>
                      <option value="yes" className="bg-gray-800">Yes</option>
                      <option value="no" className="bg-gray-800">No</option>
                    </select>
                  </div>
                </div>
                {hoa === 'yes' && (
                  <div className="mt-3"><label className="block text-gray-400 text-xs mb-1">HOA Amount ($/month)</label><input type="text" value={hoaAmount} onChange={e => { const v = formatDollar(e.target.value); setHoaAmount(v); rerunChecker(listing, { hoaAmount: v }); }} placeholder="$150/month" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500" /></div>
                )}
              </div>
            )}
            {!parcelLoaded && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-3">Or enter property details manually:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><input type="number" value={beds} onChange={e => { setBeds(e.target.value); rerunChecker(listing, { beds: e.target.value }); }} placeholder="Beds" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                  <div><input type="number" value={baths} onChange={e => { setBaths(e.target.value); rerunChecker(listing, { baths: e.target.value }); }} placeholder="Baths" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                  <div><input type="number" value={sqft} onChange={e => { setSqft(e.target.value); rerunChecker(listing, { sqft: e.target.value }); }} placeholder="Sqft" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                  <div><input type="number" value={yearBuilt} onChange={e => { setYearBuilt(e.target.value); rerunChecker(listing, { yearBuilt: e.target.value }); }} placeholder="Year Built" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><input type="text" value={price} onChange={e => { const v = formatDollar(e.target.value); setPrice(v); rerunChecker(listing, { price: v }); }} placeholder="$569,900" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                  <div>
                    <select value={hoa} onChange={e => { setHoa(e.target.value); rerunChecker(listing, { hoa: e.target.value }); }} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="" className="bg-gray-800">HOA?</option>
                      <option value="yes" className="bg-gray-800">Yes</option>
                      <option value="no" className="bg-gray-800">No</option>
                    </select>
                  </div>
                </div>
                {hoa === 'yes' && (
                  <div className="mt-3"><input type="text" value={hoaAmount} onChange={e => { const v = formatDollar(e.target.value); setHoaAmount(v); rerunChecker(listing, { hoaAmount: v }); }} placeholder="$150/month" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400" /></div>
                )}
              </div>
            )}
            <div>
              <label className="block text-white font-semibold mb-2">Listing Description *</label>
              <textarea value={listing} onChange={e => { setListing(e.target.value); rerunChecker(e.target.value); }} placeholder="Paste your MLS listing description here..." rows={8} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a227] resize-y" required />
              <div className="flex justify-between mt-2">
                <p className="text-gray-400 text-sm">Aim for 140-160 words for best results</p>
                <p className={`text-sm font-bold ${wordCount > 200 ? 'text-red-400' : wordCount >= 140 ? 'text-green-400' : 'text-[#c9a227]'}`}>{wordCount} words</p>
              </div>
            </div>
            {listing.length > 20 && (
              <div className={`rounded-xl p-4 border ${missingInfo.percentToA >= 90 ? 'bg-green-500/10 border-green-400/30' : missingInfo.percentToA >= 70 ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">A-Grade Readiness</h4>
                  <span className={`text-2xl font-bold ${missingInfo.percentToA >= 90 ? 'text-green-400' : missingInfo.percentToA >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{missingInfo.percentToA}%</span>
                </div>
                {missingInfo.missingFields.length > 0 ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Missing details that usually block an A:</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm">{missingInfo.missingFields.map((f, i) => <li key={i}>{f}</li>)}</ul>
                    <p className="text-gray-500 text-xs mt-2">Tip: add these now for best results.</p>
                  </div>
                ) : (
                  <p className="text-green-400 text-sm">All key details found — great shot at an A!</p>
                )}
              </div>
            )}
            {!showPayment ? (
              <button onClick={handleSubmit} disabled={loading || !email || !listing} className="w-full bg-gradient-to-r from-[#c9a227] to-amber-600 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Analyze My Listing — $19.99'}
              </button>
            ) : (
              <div className="bg-white/10 rounded-xl p-6 text-center space-y-4">
                <p className="text-white font-semibold">Step 1: Complete Payment</p>
                <button onClick={handlePaymentClick} className="bg-gradient-to-r from-[#c9a227] to-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition">Pay $19.99 via Square</button>
                <p className="text-gray-400 text-sm">Step 2: After payment, click below to view your report</p>
                <button onClick={handleViewResults} className="bg-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/30 transition">View My Results</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
