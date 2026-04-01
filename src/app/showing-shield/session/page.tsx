'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSessionById, getSafetyProfile, ShowingSession } from '@/lib/showingShield';

type LocationData = {
  lat: number;
  lng: number;
  address: string;
  mapsLink: string;
};

type ChatMessage = {
  id: string;
  text: string;
  from: 'agent' | 'office';
  time: string;
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
  const [panicPhrase, setPanicPhrase] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [ending, setEnding] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Session started. Check in when you are ready.',
      from: 'office',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      if (!sessionId) { router.push('/showing-shield/dashboard'); return; }
      const [s, profile] = await Promise.all([
        getSessionById(sessionId),
        getSafetyProfile(u.uid),
      ]);
      if (!s || s.agentId !== u.uid) { router.push('/showing-shield/dashboard'); return; }
      setSession(s);
      setPanicPhrase((profile?.panicPhrase || 'I need to reschedule').toLowerCase().trim());
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const triggerSilentAlert = useCallback(async () => {
    if (alertSent) return;
    setAlertSent(true);
    try {
      const loc = location || await captureLocation();
      await fetch('/api/showing-shield/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, location: loc }),
      });
    } catch {}
  }, [alertSent, location, sessionId, captureLocation]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { id: Date.now().toString(), text, from: 'agent', time }]);
    setChatInput('');

    // Check for panic phrase — silent, no visible indication
    if (text.toLowerCase().trim().includes(panicPhrase) && panicPhrase.length > 0) {
      await triggerSilentAlert();
      // Add a normal-looking auto-reply so nothing looks suspicious
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: 'Got it, thanks for the update!',
            from: 'office',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1200);
    }
  };

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
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: '✓ Check-in received.',
          from: 'office',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTimeout(() => setCheckedIn(false), 3000);
    } catch {}
    setCheckingIn(false);
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
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Top bar — looks like a normal messaging app */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.push('/showing-shield/dashboard')} className="text-gray-500 hover:text-gray-700">
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-[#1a2b4a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          OF
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">Office</p>
          <p className="text-xs text-gray-500">Showing at {session.propertyAddress}</p>
        </div>
        {/* Subtle timer — looks like a call timer */}
        <div className={`text-xs font-mono font-semibold ${urgencyColor}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              msg.from === 'agent'
                ? 'bg-[#1a2b4a] text-white rounded-br-sm'
                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.from === 'agent' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Check in button — subtle */}
      <div className="px-4 py-2 bg-gray-100 flex justify-center">
        <button
          onClick={handleCheckin}
          disabled={checkingIn}
          className="text-xs text-gray-500 hover:text-gray-700 font-medium transition disabled:opacity-50"
        >
          {checkingIn ? 'Checking in...' : checkedIn ? '✓ Checked in' : 'Tap to check in'}
        </button>
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="Message"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={!chatInput.trim()}
          className="w-8 h-8 rounded-full bg-[#1a2b4a] flex items-center justify-center disabled:opacity-30 transition"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>

      {/* End session — very subtle at bottom */}
      <div className="bg-white px-4 pb-6 pt-1 text-center">
        <button
          onClick={handleEndSession}
          disabled={ending}
          className="text-xs text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          {ending ? 'Ending...' : 'End session'}
        </button>
      </div>

    </div>
  );
}
