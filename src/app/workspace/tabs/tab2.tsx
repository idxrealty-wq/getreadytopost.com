"use client";
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NEIGHBORHOOD_OPTIONS = [
  { id: 'schools',       label: 'Schools',          query: 'schools',               key: 'Schools',       default: true  },
  { id: 'grocery',       label: 'Grocery Stores',   query: 'grocery+stores',        key: 'Grocery',       default: true  },
  { id: 'utilities',     label: 'Utilities',        query: 'utility+company+office',key: 'Utilities',     default: true  },
  { id: 'golf',          label: 'Golf Courses',     query: 'golf+courses',          key: 'Golf',          default: false },
  { id: 'restaurants',   label: 'Restaurants',      query: 'restaurants',           key: 'Restaurants',   default: false },
  { id: 'parks',         label: 'Parks',            query: 'parks',                 key: 'Parks',         default: false },
  { id: 'medical',       label: 'Medical',          query: 'hospitals+medical',     key: 'Medical',       default: false },
  { id: 'entertainment', label: 'Entertainment',    query: 'entertainment',         key: 'Entertainment', default: false },
  { id: 'gas',           label: 'Gas Stations',     query: 'gas+stations',          key: 'Gas',           default: false },
  { id: 'shopping',      label: 'Shopping Centers', query: 'shopping+mall',         key: 'Shopping',      default: false },
];

export default function Tab2Neighborhood({ address, nearby, setNearby, onNext, listingId }: any) {
  const [selectedMaps, setSelectedMaps] = useState<Record<string, boolean>>(
    Object.fromEntries(NEIGHBORHOOD_OPTIONS.map((o) => [o.id, o.default]))
  );
  const [loading, setLoading]   = useState(false);
  const [loaded, setLoaded]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [savedOk, setSavedOk]   = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const mapKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const toggleMap = (id: string) => {
    setSelectedMaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadMaps = async () => {
    if (!address) return;
    setLoading(true);
    setLoaded(true);
    setSavedOk(false);
    try {
      const res  = await fetch('/api/workspace/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      const nearbyData = data.nearby || null;
      setNearby(nearbyData);

      // Auto-save to Firestore if we have a listingId
      if (listingId && nearbyData) {
        setSaving(true);
        try {
          await updateDoc(doc(db, 'listings', listingId), {
            nearby: nearbyData,
            updatedAt: new Date().toISOString(),
          });
          setSavedOk(true);
        } catch (e) {
          console.error('Failed to save nearby data:', e);
        } finally {
          setSaving(false);
        }
      }
    } catch (e) {
      console.error('Failed to load maps:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyCategory = (key: string, places: any[]) => {
    const lines = places
      .slice(0, 4)
      .map((p: any) => {
        const parts = [p.name];
        if (p.distance) parts.push(p.distance);
        if (p.rating)   parts.push(`⭐ ${p.rating}`);
        return parts.join(' · ');
      })
      .join('\n');
    navigator.clipboard.writeText(`${key}:\n${lines}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedOptions = NEIGHBORHOOD_OPTIONS.filter((opt) => selectedMaps[opt.id]);

  return (
    <div className="space-y-6">
      {/* Controls */}
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
        <div className="mt-6 flex items-center gap-4 flex-wrap">
          <button
            onClick={loadMaps}
            disabled={!address || loading}
            className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'Loading Maps...' : loaded ? 'Reload Maps' : 'Load Maps & Data'}
          </button>
          {saving && <span className="text-gray-300 text-sm">💾 Saving to Vault...</span>}
          {savedOk && !saving && <span className="text-green-400 text-sm font-bold">✅ Saved to Vault</span>}
        </div>
      </div>

      {loaded && (
        <>
          {/* Property Location Map */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">📍 Property Location</h2>
            <iframe
              className="w-full h-96 rounded-xl"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${encodeURIComponent(address)}&zoom=17`}
            />
          </div>

          {/* Neighborhood Category Bubbles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedOptions.map((opt) => {
              const places: any[] = (nearby && nearby[opt.key]) ? nearby[opt.key].slice(0, 4) : [];
              return (
                <div key={opt.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{opt.label}</h3>
                    {places.length > 0 && (
                      <button
                        onClick={() => copyCategory(opt.key, places)}
                        className="text-xs bg-[#c9a227]/20 hover:bg-[#c9a227]/40 text-[#c9a227] border border-[#c9a227]/40 px-3 py-1 rounded-full font-bold transition"
                      >
                        {copiedKey === opt.key ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    )}
                  </div>

                  {/* Map */}
                  <iframe
                    className="w-full h-64 rounded-xl mb-4"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/search?key=${mapKey}&q=${opt.query}+near+${encodeURIComponent(address)}&zoom=14`}
                  />

                  {/* Place Bubbles */}
                  {places.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {places.map((place: any, i: number) => (
                        <div
                          key={i}
                          className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white flex items-center gap-2"
                        >
                          <span className="font-semibold">{place.name}</span>
                          {place.distance && <span className="text-gray-300 text-xs">{place.distance}</span>}
                          {place.rating && <span className="text-[#c9a227] text-xs">⭐ {place.rating}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No data available for this category.</p>
                  )}
                </div>
              );
            })}
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
