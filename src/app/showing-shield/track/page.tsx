'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type LocationData = {
  lat: number;
  lng: number;
  address: string;
  mapsLink: string;
  updatedAt: string;
};

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center">
        <p className="text-white text-lg">Loading tracker...</p>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch location ─────────────────────────────────────────────────
  const fetchLocation = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/showing-shield/live-location?userId=${userId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('No location data yet. Waiting for signal...');
        }
        return;
      }
      const data = await res.json();
      setLocation(data);
      setError('');
      const updated = new Date(data.updatedAt);
      setLastUpdate(updated.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    } catch {
      setError('Connection lost. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  // ── Poll every 10 seconds ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setError('No tracking ID provided.');
      setLoading(false);
      return;
    }
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);

  // ── Load Google Maps ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-maps-track')) return;
    const script = document.createElement('script');
    script.id = 'google-maps-track';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Initialize and update map ─────────────────────────────────────
  useEffect(() => {
    if (!location || !mapRef.current) return;
    if (!window.google?.maps) {
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 300);
      return () => clearInterval(checkInterval);
    } else {
      initMap();
    }

    function initMap() {
      if (!location || !mapRef.current) return;
      const pos = { lat: location.lat, lng: location.lng };
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: pos,
          zoom: 16,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0d1f3c' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1f3c' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#c9a227' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2b4a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08152b' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });
      } else {
        googleMapRef.current.panTo(pos);
      }
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: pos,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#c9a227',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });
      } else {
        markerRef.current.setPosition(pos);
      }
    }
  }, [location]);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Locating...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Invalid tracking link.</p>
          <p className="text-gray-400 text-sm mt-2">Please ask the person to resend their tracking link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08152b] flex flex-col" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div className="bg-[#0d1f3c] border-b border-[#c9a227]/30 px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-sm flex-shrink-0">
          SS
        </div>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">Showing Shield</p>
          <p className="text-[#c9a227]/80 text-xs">Live Location Tracker</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          <span className="text-emerald-400 text-xs font-semibold">LIVE</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '60vh' }}>
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        {!location && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#08152b]/80">
            <p className="text-gray-400 text-sm">{error || 'Waiting for location...'}</p>
          </div>
        )}
      </div>

      {/* Location info */}
      <div className="bg-[#0d1f3c] border-t border-[#c9a227]/30 px-4 py-4 space-y-3">

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {location && (
          <>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-lg mt-0.5">📍</span>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{location.address}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Last updated: {lastUpdate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={location.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#c9a227] text-[#08152b] font-bold text-sm py-3 rounded-xl text-center hover:bg-[#d4ad2e] transition"
              >
                Open in Maps
              </a>
              <a
                href={`tel:`}
                className="bg-[#1a2b4a] border border-[#c9a227]/40 text-[#c9a227] font-bold text-sm py-3 rounded-xl text-center hover:bg-[#c9a227] hover:text-[#08152b] transition"
              >
                Call Now
              </a>
            </div>

            <div className="bg-[#1a2b4a] rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-[#c9a227] text-xs">🔄</span>
              <p className="text-gray-400 text-xs">Location refreshes automatically every 10 seconds</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

