"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPropertyLocationFromGPS } from '@/lib/geolocation';

export default function PropertyIdentifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGetLocation = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const geoResult = await getPropertyLocationFromGPS();

    if (geoResult.error) {
      setError(geoResult.error);
      setLoading(false);
      return;
    }

    setResult(geoResult);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!result) return;

    // Store in localStorage for workspace to pick up
    const propertyData = {
      address: result.address || '',
      city: result.city || '',
      state: result.state || '',
      zip: result.zip || '',
      county: result.county || '',
      latitude: result.latitude,
      longitude: result.longitude,
    };

    localStorage.setItem('propertyIdentifyData', JSON.stringify(propertyData));

    // Redirect to workspace
    router.push('/workspace');
  };

  const handleCancel = () => {
    setResult(null);
    setError('');
    setLoading(false);
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Property Location Identifier
          </h1>
          <p className="text-gray-300 text-lg">
            Use GPS to quickly locate and identify a property
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          {!result ? (
            <div className="text-center">
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="bg-[#c9a227] hover:bg-[#b8911f] disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold text-lg transition mb-4"
              >
                {loading ? 'Getting Location...' : '📍 Get My Location'}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl">
                  <p className="text-red-300 font-bold">{error}</p>
                  <p className="text-red-200 text-sm mt-2">
                    Make sure location services are enabled in your browser.
                  </p>
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Tip:</strong> This will request access to your device's GPS. Your location is only used to identify the property address and is not stored.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-300 font-bold mb-2">✓ Location Found</p>
                <div className="space-y-2 text-sm text-gray-200">
                  <p><strong>Address:</strong> {result.address}</p>
                  {result.city && <p><strong>City:</strong> {result.city}</p>}
                  {result.state && <p><strong>State:</strong> {result.state}</p>}
                  {result.zip && <p><strong>ZIP:</strong> {result.zip}</p>}
                  {result.county && <p><strong>County:</strong> {result.county}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    Lat: {result.latitude.toFixed(6)} | Lng: {result.longitude.toFixed(6)}
                  </p>
                  {result.accuracy && (
                    <div className={`mt-3 p-2 rounded ${result.accuracy < 20 ? 'bg-green-900/30 border border-green-600/50' : result.accuracy < 50 ? 'bg-yellow-900/30 border border-yellow-600/50' : 'bg-orange-900/30 border border-orange-600/50'}`}>
                      <p className={`text-xs font-bold ${result.accuracy < 20 ? 'text-green-300' : result.accuracy < 50 ? 'text-yellow-300' : 'text-orange-300'}`}>
                        📍 GPS Accuracy: ±{Math.round(result.accuracy)} meters
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {result.accuracy < 20 ? '✓ Excellent — likely exact property' : result.accuracy < 50 ? '⚠ Good — verify address is correct' : '⚠ Fair — may need adjustment in subdivision'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-xl font-bold transition"
                >
                  ✓ Confirm & Go to Workspace
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold transition"
                >
                  ✕ Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/workspace"
            className="text-gray-300 hover:text-white text-sm transition"
          >
            ← Back to Workspace
          </a>
        </div>
      </div>
    </main>
  );
}
