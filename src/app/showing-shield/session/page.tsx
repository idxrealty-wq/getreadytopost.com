'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSessionById, ShowingSession } from '@/lib/showingShield';

type LocationData = {
  lat: number;
  lng: number;
  address: string;
  mapsLink: string;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    if (data.results?.[0]) return data.results[0].formatted_address;
  } catch {}
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

async function getLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const address = await reverseGeocode(lat, lng);
        resolve({
          lat,
          lng,
          address,
          mapsLink: `https://maps.google.com/?q=${lat},${lng}`,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08152b] flex items-center justify-center"><p className="text-white text-lg">Loading session...</p></div>}>
      <SessionContent />
    </Suspense>
  );
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<ShowingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [panicState, setPanicState] = useState<'idle' | 'confirming' | 'sending' | 'sent' | 'error'>('idle');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [ending, setEnding] = useState(false);
  const [panicError, setPanicError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      if (!sessionId) { router.push('/showing-shield/dashboard'); return; }
      const s = await getSessionById(sessionId);
      if (!s || s.agentId !== u.uid) { router.push('/showing-shield/dashboard'); return; }
      setSession(s);
      const startedMs = new Date(s.startedAt).getTime();
      const durationMs = s.scheduledDuration * 60 * 1000;
      const elapsedMs = Date.now() - startedMs;
      const remainingMs = durationMs - elapsedMs;
      setTimeLeft(Math.max(0, Math.floor(remainingMs / 1000)));
      setElapsed(Math.floor(elapsedMs / 1000));
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session]);

  const captureLocation = useCallback(async () => {
    setLocating(true);
    const loc = await getLocation();
    setLocation(loc);
    setLocating(false);
    return loc;
  }, []);

  useEffect(() => {
    if (session) captureLocation();
  }, [session]);

  const handleCheckin = async () => {
    if (!sessionId) return;
    setCheckingIn(true);
    try {
      await fetch('/api/showing-shield/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setCheckedIn(true);
      setTimeout(() => setCheckedIn(false), 3000);
    } catch {}
    setCheckingIn(false);
  };

  const handlePanic = async () => {
    if (panicState === 'idle') { setPanicState('confirming'); return; }
    if (panicState !== 'confirming') return;
    setPanicState('sending');
    setPanicError('');
    try {
      const loc = location || await captureLocation();
      const res = await fetch('/api/showing-shield/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, location: loc }),
      });
      const data = await res.json();
      if (res.ok) {
        setPanicState('sent');
      } else {
        setPanicError(data.error || 'Alert failed.');
        setPanicState('error');
      }
    } catch {
      setPanicError('Network error. Try again.');
      setPanicState('error');
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    setEnding(true);
    try {
      await fetch('/api/showing-shield/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      router.push('/showing-shield/dashboard');
    } catch {}
    setEnding(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    );
  }

  if (!session) return null;

  const isOverdue = timeLeft === 0;
  const urgencyColor = isOverdue ? 'text-red-400' : timeLeft < 300 ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className="min-h-screen bg-[#08152b] pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        <div className="text-center">
          <p className="text-[#c9a227] font-semibold uppercase tracking-widest text-xs mb-1">Showing Shield</p>
          <h1 className="text-2xl font-bold text-white">Active Session</h1>
          <p className="text-gray-400 text-sm mt-1">{session.propertyAddress}</p>
        </div>

        <div className={`bg-white/5 border ${isOverdue ? 'border-red-500/60' : 'border-white/10'} rounded-2xl p-6 text-center`}>
          <p className="text-gray-400 text-sm mb-1">{isOverdue ? '⚠️ Time Expired' : 'Time Remaining'}</p>
          <p className={`text-6xl font-mono font-bold ${urgencyColor}`}>{formatTime(timeLeft)}</p>
          <p className="text-gray-500 text-xs mt-2">Elapsed: {formatTime(elapsed)}</p>
          {isOverdue && (
            <p className="text-red-400 text-sm font-semibold mt-3">
              Scheduled duration exceeded. Check in or end session now.
            </p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Client</span>
            <span className="text-white font-semibold">{session.clientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Started</span>
            <span className="text-white">{new Date(session.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Duration</span>
            <span className="text-white">{session.scheduledDuration} min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Contacts</span>
            <span className="text-white">{session.emergencyContacts.length} configured</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold text-sm">📍 Your Location</span>
            <button
              onClick={captureLocation}
              disabled={locating}
              className="text-[#c9a227] hover:text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {locating ? 'Updating...' : 'Refresh'}
            </button>
          </div>
          {location ? (
            <div>
              <p className="text-gray-300 text-sm">{location.address}</p>
              <a
                href={location.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a227] text-xs hover:underline mt-1 inline-block"
              >
                Open in Google Maps →
              </a>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">{locating ? 'Getting location...' : 'Location unavailable'}</p>
          )}
        </div>

        <button
          onClick={handleCheckin}
          disabled={checkingIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-lg transition disabled:opacity-50"
        >
          {checkingIn ? 'Checking in...' : checkedIn ? '✅ Checked In!' : '✋ I\'m Safe — Check In'}
        </button>

        {panicState === 'sent' ? (
          <div className="bg-red-900/80 border-2 border-red-500 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-3">🚨</p>
            <p className="text-white font-bold text-xl mb-2">Emergency Alert Sent</p>
            <p className="text-red-200 text-sm">
              Your emergency contacts have been notified with your location and property address.
            </p>
          </div>
        ) : (
          <div>
            {panicState === 'confirming' && (
              <div className="bg-red-900/60 border border-red-500/60 rounded-2xl p-4 text-center mb-3">
                <p className="text-white font-bold mb-1">Confirm Emergency Alert</p>
                <p className="text-red-200 text-sm">This will immediately SMS all your emergency contacts with your location.</p>
              </div>
            )}
            {panicError && (
              <p className="text-red-400 text-sm text-center mb-3">{panicError}</p>
            )}
            <button
              onClick={handlePanic}
              disabled={panicState === 'sending'}
              className={`w-full font-bold py-5 rounded-2xl text-xl transition ${
                panicState === 'confirming'
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : panicState === 'sending'
                  ? 'bg-red-800 text-white opacity-70'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {panicState === 'sending' ? '🚨 Sending Alert...' : panicState === 'confirming' ? '🚨 TAP AGAIN TO CONFIRM' : '🚨 PANIC — Send Emergency Alert'}
            </button>
            {panicState === 'confirming' && (
              <button
                onClick={() => setPanicState('idle')}
                className="w-full text-gray-400 hover:text-white text-sm font-semibold mt-2 transition"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleEndSession}
          disabled={ending}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50"
        >
          {ending ? 'Ending...' : '✅ End Session Safely'}
        </button>

      </div>
    </div>
  );
}
