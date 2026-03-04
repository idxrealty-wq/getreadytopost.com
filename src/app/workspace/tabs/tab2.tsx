"use client";
import { useState } from 'react';

const NEIGHBORHOOD_OPTIONS = [
  { id: 'schools', label: 'Schools', query: 'schools', key: 'Schools', default: true },
  { id: 'grocery', label: 'Grocery Stores', query: 'grocery+stores', key: 'Grocery', default: true },
  { id: 'utilities', label: 'Utilities', query: 'utility+company+office', key: 'Utilities', default: true },
  { id: 'golf', label: 'Golf Courses', query: 'golf+courses', key: 'Golf', default: false },
  { id: 'restaurants', label: 'Restaurants', query: 'restaurants', key: 'Restaurants', default: false },
  { id: 'parks', label: 'Parks', query: 'parks', key: 'Parks', default: false },
  { id: 'medical', label: 'Medical', query: 'hospitals+medical', key: 'Medical', default: false },
  { id: 'entertainment', label: 'Entertainment', query: 'entertainment', key: 'Entertainment', default: false },
  { id: 'gas', label: 'Gas Stations', query: 'gas+stations', key: 'Gas', default: false },
  { id: 'shopping', label: 'Shopping Centers', query: 'shopping+mall', key: 'Shopping', default: false },
];

export default function Tab2Neighborhood({ address, nearby, setNearby, onNext }: any) {
  const [selectedMaps, setSelectedMaps] = useState<Record<string, boolean>>(
    Object.fromEntries(NEIGHBORHOOD_OPTIONS.map((o) => [o.id, o.default]))
  );
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const toggleMap = (id: string) => {
    setSelectedMaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMaps = () => {
    if (!address) return;
    setLoading(true);
    setLoaded(true);
    fetch('/api/workspace/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNearby(data.nearby || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const selectedOptions = NEIGHBORHOOD_OPTIONS.filter((opt) => selectedMaps[opt.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Select Neighborhood Data</h2>
        <p className="text-gray-300 mb-6">Choose which categories matter for this listing:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {NEIGHBORHOOD_OPTIONS.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/20 transition">
              <input
                type="checkbox"
                checked={selectedMaps[opt.id]}
                onChange={() => toggleMap(opt.id)}
                className="w-5 h-5 accent-[#c9a227]"
              />
              <span className="text-white text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-6">
          <button
            onClick={loadMaps}
            disabled={!address || loading}
            className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Loading Maps...' : loaded ? 'Reload Maps' : 'Load Maps & Data'}
          </button>
        </div>
      </div>

      {loaded && (
        <>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Property Location</h2>
            <iframe
              className="w-full h-96 rounded-xl"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${encodeURIComponent(address)}&zoom=17`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedOptions.map((opt) => (
              <div key={opt.id} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-3">{opt.label}</h3>
                <iframe
                  className="w-full h-64 rounded-lg"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/search?key=${mapKey}&q=${opt.query}+near+${encodeURIComponent(address)}&zoom=14`}
                />
                {nearby && nearby[opt.key] && nearby[opt.key].length > 0 && (
                  <div className="mt-3 space-y-2">
                    {nearby[opt.key].slice(0, 4).map((place: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white">{place.name}</span>
                        <span className="text-gray-300 ml-2 whitespace-nowrap">
                          {place.distance || ''} {place.rating ? '\u2B50' + place.rating : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!loaded}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Generate Listing
        </button>
      </div>
    </div>
  );
}
