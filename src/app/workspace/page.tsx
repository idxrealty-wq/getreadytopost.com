"use client";
import { useState } from 'react';

export default function WorkspacePage() {
  const [address, setAddress] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMaps, setShowMaps] = useState(false);
  const [listing, setListing] = useState('');
  const [nearby, setNearby] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!address) return;
    setShowMaps(true);
    setListing('');
    setNearby(null);
    setError('');
    setLoading(true);

    fetch('/api/workspace/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        propertyDetails: { beds, baths, sqft, price, features },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setListing(data.listing || '');
          setNearby(data.nearby || null);
        }
      })
      .catch(() => {
        setError('Analysis failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const copyListing = () => {
    if (listing) {
      navigator.clipboard.writeText(listing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">🏡 Agent Workspace</h1>
          <p className="text-gray-300 text-lg">Build data-rich listings with real neighborhood insights</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8 sticky top-20 z-30">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Orlando, FL 32801"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!address}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input type="text" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="Beds" className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            <input type="text" value={baths} onChange={(e) => setBaths(e.target.value)} placeholder="Baths" className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            <input type="text" value={sqft} onChange={(e) => setSqft(e.target.value)} placeholder="Sqft" className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Pool, etc." className="px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {showMaps && (
          <div className="space-y-6">

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📍 Property Location</h2>
              <iframe
                className="w-full h-96 rounded-xl"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${encodeURIComponent(address)}&zoom=17&maptype=satellitezoom=17`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '🏫 Schools', query: 'schools', key: 'Schools' },
                { label: '🍽️ Restaurants', query: 'restaurants', key: 'Restaurants' },
                { label: '🌳 Parks', query: 'parks', key: 'Parks' },
                { label: '🛒 Shopping', query: 'grocery+stores', key: 'Shopping' },
                { label: '🏥 Medical', query: 'hospitals', key: 'Medical' },
                { label: '🎭 Entertainment', query: 'entertainment', key: 'Entertainment' },
                { label: '🚌 Transit', query: 'transit', key: 'Transit' },
                { label: '⛽ Gas', query: 'gas+stations', key: 'Gas' },
              ].map((cat) => (
                <div key={cat.label} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">{cat.label}</h3>
                  <iframe
                    className="w-full h-64 rounded-lg"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${mapKey}&q=${cat.query}+near+${encodeURIComponent(address)}&zoom=14&maptype=satellitezoom=14`}
                  />
                  {nearby && nearby[cat.key] && nearby[cat.key].length > 0 && (
                    <div className="mt-3 space-y-2">
                      {nearby[cat.key].slice(0, 4).map((place: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white">{place.name}</span>
                          <span className="text-gray-300 ml-2 whitespace-nowrap">
                            {place.distance || ''} {place.rating ? `⭐${place.rating}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 relative">
              <div className="absolute top-4 left-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">
                A+
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 ml-20">✨ AI-Generated Listing</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300">Generating your A+ listing with real neighborhood data...</p>
                </div>
              ) : listing ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
                  <p className="text-white text-lg leading-relaxed">{listing}</p>
                </div>
              ) : (
                <p className="text-gray-300 mb-4">Waiting for analysis to complete...</p>
              )}
              <div className="flex gap-3">
                <button onClick={copyListing} disabled={!listing} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button disabled={!listing} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">
                  💾 Save to Vault
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
