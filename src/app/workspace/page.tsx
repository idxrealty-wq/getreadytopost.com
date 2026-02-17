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
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);

    try {
      const response = await fetch('/api/workspace/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          propertyDetails: { beds, baths, sqft, price, features },
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyListing = () => {
    if (results?.listing) {
      navigator.clipboard.writeText(results.listing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              placeholder="Property Address"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !address}
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

        {results && (
          <div className="space-y-6">
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📍 Property Location</h2>
              <iframe
                className="w-full h-96 rounded-xl"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}&maptype=satellitezoom=14&maptype=satellitemaptype=satellite`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '🏫 Schools', query: 'schools' },
                { label: '🍽️ Restaurants', query: 'restaurants' },
                { label: '🌳 Parks', query: 'parks' },
                { label: '🛒 Shopping', query: 'grocery+stores' },
                { label: '🏥 Medical', query: 'hospitals' },
                { label: '🎭 Entertainment', query: 'entertainment' },
                { label: '🚌 Transit', query: 'transit' },
                { label: '⛽ Gas', query: 'gas+stations' },
              ].map((cat) => (
                <div key={cat.label} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">{cat.label}</h3>
                  <iframe
                    className="w-full h-64 rounded-lg"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${cat.query}+near+${encodeURIComponent(address)}&maptype=satellitezoom=14&maptype=satellitemaptype=satellite`}
                  />
                  {results.nearby && results.nearby[cat.label.split(' ')[1]] && (
                    <div className="mt-3 space-y-1">
                      {results.nearby[cat.label.split(' ')[1]].slice(0, 3).map((place: any, i: number) => (
                        <p key={i} className="text-white text-sm">
                          • {place.name} {place.distance && `(${place.distance})`}
                        </p>
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
              <h2 className="text-2xl font-bold text-white mb-4">✨ AI-Generated Listing</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-4">
                <p className="text-white text-lg leading-relaxed">{results.listing}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={copyListing} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition">
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">
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
