'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddressAutosuggest from '@/components/AddressAutosuggest';

export default function RateMyListingPage() {
  const router = useRouter();

  const [listingDescription, setListingDescription] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('Florida');
  const [city, setCity] = useState('Orlando');
  const [address, setAddress] = useState('');

  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [price, setPrice] = useState('');
  const [hoa, setHoa] = useState('');
  const [hoaAmount, setHoaAmount] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAddressSelect = (parcel: any) => {
    if (parcel?.beds) setBeds(String(parcel.beds));
    if (parcel?.baths) setBaths(String(parcel.baths));
    if (parcel?.sqft) setSqft(String(parcel.sqft));
    if (parcel?.year_built) setYearBuilt(String(parcel.year_built));
  };

  const handleSubmit = async () => {
    if (!listingDescription.trim() || !email.trim() || !address.trim()) {
      alert('Listing description, email, and address are required.');
      return;
    }

    setLoading(true);

    try {
      const createRes = await fetch('/api/submissions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingDescription,
          email,
          address,
          city,
          state,
          zip: '',
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseFloat(baths) : null,
          sqft: sqft ? parseInt(sqft) : null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          price: price ? parseInt(price.replace(/,/g, '')) : null,
          hoa: hoa === 'yes' ? 'yes' : 'no',
          hoaAmount: hoaAmount ? parseFloat(hoaAmount.replace(/,/g, '')) : null,
        }),
      });

      const createText = await createRes.text();
      let createJson: any = null;
      try {
        createJson = JSON.parse(createText);
      } catch {}

      if (!createRes.ok) {
        alert(createJson?.error || createText || 'Create failed');
        setLoading(false);
        return;
      }

      const submissionId = createJson?.submissionId;
      if (!submissionId) {
        alert('Create failed: missing submissionId');
        setLoading(false);
        return;
      }

      const analysisRes = await fetch('/api/submissions/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      const analysisText = await analysisRes.text();
      let analysisJson: any = null;
      try {
        analysisJson = JSON.parse(analysisText);
      } catch {}

      if (!analysisRes.ok) {
        alert(analysisJson?.error || analysisText || 'Analysis failed');
        setLoading(false);
        return;
      }

      if (analysisJson?.ok) {
        setSubmitted(true);
        setTimeout(() => router.push(`/results/original/${submissionId}`), 800);
        return;
      }

      alert('Analysis failed: unknown response');
    } catch (e: any) {
      alert(`Error: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Complete!</h1>
          <p className="text-gray-300 mb-8">Redirecting to your report...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed pt-16 pb-10 px-4 relative"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&h=1000&fit=crop")',
      }}
    >
      <div className="absolute inset-0 bg-black/45"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Rate My Listing</h1>
          <p className="text-gray-300 mb-8">Get an instant AI-powered analysis of your listing description</p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Listing Description</label>
              <textarea
                value={listingDescription}
                onChange={(e) => setListingDescription(e.target.value)}
                placeholder="Paste your listing description here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Property Address (United States)</label>
              <AddressAutosuggest
                value={address}
                onChange={setAddress}
                onSelect={handleAddressSelect}
                state={state}
                city={city}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Beds</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Baths</label>
                <input
                  type="number"
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Square Feet</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Year Built</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">List Price</label>
              <input
                type="text"
                value={price ? Number(price).toLocaleString() : ''}
                onChange={(e) => setPrice(e.target.value.replace(/,/g, ''))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">HOA</label>
              <select
                value={hoa}
                onChange={(e) => setHoa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
              >
                <option value="">Do you have an HOA?</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hoa === 'yes' && (
              <div>
                <label className="block text-gray-400 text-xs mb-1">HOA Amount (Monthly)</label>
                <input
                  type="text"
                  value={hoaAmount ? Number(hoaAmount).toLocaleString() : ''}
                  onChange={(e) => setHoaAmount(e.target.value.replace(/,/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze My Listing'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
