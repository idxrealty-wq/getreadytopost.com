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
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAddressSelect = (parcel: any) => {
    if (parcel.beds) setBeds(parcel.beds);
    if (parcel.baths) setBaths(parcel.baths);
    if (parcel.sqft) setSqft(parcel.sqft);
    if (parcel.year_built) setYearBuilt(parcel.year_built);
  };

  const handleSubmit = async () => {
    if (!listingDescription || !email || !address) {
      alert('Listing description, email, and address are required');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create submission
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
          price: price ? parseInt(price) : null,
          hoa: hoa === 'yes' ? true : false,
          hoaAmount: hoaAmount ? parseFloat(hoaAmount) : null,
        }),
      });

      const createResult = await createRes.json();
      if (!createResult.submissionId) {
        alert('Failed to create submission: ' + (createResult.error || 'Unknown error'));
        setLoading(false);
        return;
      }

      const submissionId = createResult.submissionId;

      // Step 2: Run analysis
      const analysisRes = await fetch('/api/submissions/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      const analysisResult = await analysisRes.json();
      if (analysisResult.ok) {
        setSubmitted(true);
        setTimeout(() => router.push(`/results?id=${submissionId}`), 2000);
      } else {
        alert('Analysis failed: ' + (analysisResult.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Error: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Complete!</h1>
          <p className="text-gray-300 mb-8">Redirecting to results...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">Rate My Listing</h1>
          <p className="text-gray-300 mb-8">Get an instant AI-powered analysis of your listing description</p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Listing Description</label>
              <p className="text-gray-500 text-xs mb-2">Paste your current MLS or listing description here</p>
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
                  placeholder="Florida"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Orlando"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Property Address (United States)</label>
              <p className="text-gray-500 text-xs mb-2">Tip: Add City + State above for faster, accurate results.</p>
              <AddressAutosuggest value={address} onChange={setAddress} onSelect={handleAddressSelect} state={state} city={city} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Beds</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Baths</label>
                <input
                  type="number"
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  placeholder="2"
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
                  placeholder="2000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Year Built</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder="2015"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">List Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="450000"
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
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hoa === 'yes' && (
              <div>
                <label className="block text-gray-400 text-xs mb-1">HOA Amount (Monthly)</label>
                <input
                  type="number"
                  value={hoaAmount}
                  onChange={(e) => setHoaAmount(e.target.value)}
                  placeholder="250"
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
