'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSessionById, getSafetyProfile, ShowingSession } from '@/lib/showingShield';
import { captureEvidence } from '@/lib/evidenceCapture';

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
        resolve({ lat, lng, address, mapsLink: `https://maps.google.com/?q=${lat},${lng}` });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    }>
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
  const [timerReady, setTimerReady] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [autoAlertFired, setAutoAlertFired] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [ending, setEnding] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Good luck with that showing!',
      from: 'office',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alertSentRef = useRef(false);
  const warmStreamRef = useRef<MediaStream | null>(null);

  // ── Warm up camera on session load ──────────────────────────────────
  useEffect(() => {
    if (!session) return;
    let active = true;
    async function warmCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        warmStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        setCameraReady(false);
      }
    }
    warmCamera();
    return () => {
      active = false;
      if (warmStreamRef.current) {
        warmStreamRef.current.getTracks().forEach((t) => t.stop());
        warmStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [session]);

  // ── Auth + session load ─────────────────────────────────────────────
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
      setPanicPhrase((profile?.panicPhrase || '').toLowerCase().trim());
      const startedMs = new Date(s.startedAt).getTime();
      const durationMs = s.scheduledDuration * 60 * 1000;
      const remainingMs = durationMs - (Date.now() - startedMs);
      const remaining = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeft(remaining);
      setTimerReady(remaining > 0);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId, router]);

  // ── Countdown timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session]);

  // ── Auto-scroll chat ───────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Location ───────────────────────────────────────────────────────
  const captureLocation = useCallback(async () => {
    const loc = await getLocation();
    setLocation(loc);
    return loc;
  }, []);

  useEffect(() => {
    if (session) captureLocation();
  }, [session, captureLocation]);

  // ── Silent alert trigger ───────────────────────────────────────────
  const triggerSilentAlert = useCallback(async () => {
    if (alertSentRef.current) return;
    alertSentRef.current = true;
    setAlertSent(true);
    try {
      const loc = location || await captureLocation();
      let evidenceUrls: string[] = [];
      if (videoRef.current && canvasRef.current && sessionId && warmStreamRef.current) {
        try {
          evidenceUrls = await captureEvidence(sessionId, videoRef.current, canvasRef.current);
        } catch {}
      }
      if (warmStreamRef.current) {
        warmStreamRef.current.getTracks().forEach((t) => t.stop());
        warmStreamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      await fetch('/api/showing-shield/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, location: loc, evidenceUrls }),
      });
    } catch {}
  }, [location, sessionId, captureLocation]);

  // ── Auto-alert on timer expiry ─────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && session && !autoAlertFired && !loading && timerReady) {
      setAutoAlertFired(true);
      triggerSilentAlert();
    }
  }, [timeLeft, session, autoAlertFired, loading, timerReady, triggerSilentAlert]);

  // ── Chat send ──────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { id: Date.now().toString(), text, from: 'agent', time }]);
    setChatInput('');
    if (panicPhrase.length > 0 && text.toLowerCase().includes(panicPhrase)) {
      await triggerSilentAlert();
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          text: 'Got it, thanks for the update!',
          from: 'office',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 1200);
    }
  };

  // ── Check-in ───────────────────────────────────────────────────────
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
      setAutoAlertFired(false);
      alertSentRef.current = false;
      setAlertSent(false);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: 'Check-in received. Stay safe.',
        from: 'office',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setTimeout(() => setCheckedIn(false), 3000);
    } catch {}
    setCheckingIn(false);
  };

  // ── End session ────────────────────────────────────────────────────
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
      <div className="fixed inset-0 bg-[#08152b] flex items-center justify-center">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    );
  }

  if (!session) return null;

  const isOverdue = timeLeft === 0;
  const timerColor = isOverdue ? 'text-red-400' : timeLeft < 300 ? 'text-[#c9a227]' : 'text-emerald-400';
  const timerBg = isOverdue ? 'bg-red-900/40 border-red-500/40' : timeLeft < 300 ? 'bg-yellow-900/40 border-yellow-500/40' : 'bg-emerald-900/40 border-emerald-500/40';

  return (
    <div className="fixed inset-0 bg-[#08152b] flex flex-col" style={{ fontFamily: 'system-ui, sans-serif' }}>

      <video ref={videoRef} muted playsInline
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />
      <canvas ref={canvasRef}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} />

      {/* Top bar */}
      <div className="bg-[#0d1f3c] border-b border-[#c9a227]/30 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push('/showing-shield/dashboard')}
          className="text-[#c9a227] hover:text-white font-bold text-lg leading-none transition flex-shrink-0"
          aria-label="Back to dashboard"
        >
          &larr;
        </button>
        <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-sm flex-shrink-0">
          SS
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">Showing Shield</p>
          <p className="text-[#c9a227]/80 text-xs truncate">{session.propertyAddress}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold flex-shrink-0 ${timerBg} ${timerColor}`}>
          {isOverdue ? 'OVERDUE' : formatTime(timeLeft)}
        </div>
      </div>

      {/* Camera status indicator */}
      {cameraReady && (
        <div className="bg-emerald-900/20 border-b border-emerald-500/20 px-4 py-1.5 flex items-center gap-2 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          <p className="text-emerald-400/70 text-[10px]">Photo backup active</p>
        </div>
      )}

      {/* Location bar */}
      {location && (
        <div className="bg-[#0d1f3c]/80 border-b border-white/5 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <span className="text-emerald-400 text-xs">&#128205;</span>
          <p className="text-gray-400 text-xs truncate flex-1">{location.address}</p>
          <a href={location.mapsLink} target="_blank" rel="noopener noreferrer"
            className="text-[#c9a227] text-xs font-semibold hover:underline flex-shrink-0">
            Map
          </a>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'office' && (
              <div className="w-7 h-7 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-[10px] mr-2 flex-shrink-0 self-end">
                SS
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-lg ${msg.from === 'agent' ? 'bg-[#c9a227] text-[#08152b] rounded-br-sm' : 'bg-[#1a2b4a] text-white border border-white/10 rounded-bl-sm'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.from === 'agent' ? 'text-[#08152b]/50' : 'text-gray-500'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Check-in button */}
      <div className="bg-[#0d1f3c] border-t border-white/10 px-4 py-2 flex justify-center flex-shrink-0">
        <button
          onClick={handleCheckin}
          disabled={checkingIn}
          className={`text-sm font-semibold px-6 py-2 rounded-full border transition ${checkedIn ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#1a2b4a] border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227] hover:text-[#08152b]'} disabled:opacity-50`}
        >
          {checkingIn ? 'Checking in...' : checkedIn ? 'Checked In ✓' : 'Tap to Check In'}
        </button>
      </div>

      {/* Message input */}
      <div className="bg-[#0d1f3c] border-t border-[#c9a227]/20 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="Message"
          className="flex-1 bg-[#1a2b4a] text-white placeholder-gray-500 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a227]/60"
        />
        <button
          onClick={handleSendMessage}
          className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center text-[#08152b] font-bold text-lg flex-shrink-0 hover:bg-[#d4ad2e] transition"
          aria-label="Send message"
        >
          &rarr;
        </button>
      </div>

      {/* End session */}
      <div className="bg-[#08152b] border-t border-white/5 px-4 py-2 flex justify-center flex-shrink-0">
        <button
          onClick={handleEndSession}
          disabled={ending}
          className="text-gray-500 hover:text-red-400 text-xs font-medium transition disabled:opacity-50"
        >
          {ending ? 'Ending...' : 'End Session'}
        </button>
      </div>

    </div>
  );
}
