"use client";
import { useState } from 'react';

export default function WorkspacePage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!address) return;
    setLoading(true);
    // TODO: Connect to backend
    setTimeout(() => {
      setResults({ address });
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">🏡 Agent Workspace</h1>
          <p className="text-gray-300 text-lg">Build data-rich listings with real neighborhood insights</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8 sticky top-20 z-30">
          <label className="block text-white font-semibold mb-3 text-lg">Property Address</label>
          <div className="flex gap-3">
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
              disabled={loading || !address}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : '🔍 Analyze'}
            </button>
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
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}&maptype=satellite`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: '🏫 Schools', query: 'schools' },
                { label: '🍽️ Restaurants', query: 'restaurants' },
                { label: '🌳 Parks & Recreation', query: 'parks' },
                { label: '🛒 Shopping & Grocery', query: 'grocery+stores+shopping' },
                { label: '🏥 Hospitals & Medical', query: 'hospitals+medical' },
                { label: '🎭 Entertainment', query: 'entertainment+movie+theaters' },
                { label: '🚌 Public Transit', query: 'transit+stations' },
                { label: '⛽ Gas & Convenience', query: 'gas+stations' },
              ].map((cat) => (
                <div key={cat.label} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">{cat.label}</h3>
                  <iframe
                    className="w-full h-64 rounded-lg"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${cat.query}+near+${encodeURIComponent(address)}&maptype=satellite`}
                  />
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-emerald-900/60 to-green-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-emerald-500/40 relative">
              <div className="absolute top-4 right-4 bg-red-500 text-white px-5 py-2 rounded-lg font-black text-2xl shadow-2xl transform -rotate-6">
                A+
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">✨ AI-Generated Listing Description</h2>
              <p className="text-gray-300 mb-4">Enter an address above to generate a professional listing description using real neighborhood data.</p>
              <div className="flex gap-3">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition">
                  📋 Copy Description
                </button>
                <button className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition">
                  💾 Save to Agent Vault
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
