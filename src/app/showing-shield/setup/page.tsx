'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSafetyProfile, saveSafetyProfile } from '@/lib/showingShield';

type EmergencyContact = {
  name: string;
  phone: string;
  email: string;
  relationship: string;
};

type LocationData = {
  lat: number;
  lng: number;
  address: string;
  mapsLink: string;
};

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

export default function SetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', email: '', relationship: '' },
  ]);
  const [panicPhrase, setPanicPhrase] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [trackingLink, setTrackingLink] = useState('');
  const [copied, setCopied] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const locationPingRef = useRef<NodeJS.Timeout | null>(null);

  // ── Auth ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/signin'); return; }
      setUserId(u.uid);
      setTrackingLink(`${window.location.origin}/showing-shield/track?id=${u.uid}`);
      const profile = await getSafetyProfile(u.uid);
      if (profile) {
        setContacts(profile.emergencyContacts?.length ? profile.emergencyContacts : [{ name: '', phone: '', email: '', relationship: '' }]);
        setPanicPhrase(profile.panicPhrase || '');
      }
    });
    return () => unsub();
  }, [router]);

  // ── Load Google Maps script ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-maps-setup')) return;
    const script = document.createElement('script');
    script.id = 'google-maps-setup';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Get location and start pinging ────────────────────────────────
  const startLocationPing = useCallback((uid: string) => {
    if (locationPingRef.current) return;
    locationPingRef.current = setInterval(async () => {
      try {
        const loc = await getLocation();
        if (!loc) return;
        setLocation(loc);
        await fetch('/api/showing-shield/live-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, location: loc }),
        });
      } catch {}
    }, 30000);
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function initLocation() {
      const loc = await getLocation();
      if (loc) {
        setLocation(loc);
        await fetch('/api/showing-shield/live-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, location: loc }),
        });
      }
      startLocationPing(userId!);
    }
    initLocation();
    return () => {
      if (locationPingRef.current) {
        clearInterval(locationPingRef.current);
        locationPingRef.current = null;
      }
    };
  }, [userId, startLocationPing]);

  // ── Initialize map ─────────────────────────────────────────────────
  useEffect(() => {
    if (!location || !mapRef.current) return;
    function tryInit() {
      if (!window.google?.maps || !mapRef.current || !location) return;
      const pos = { lat: location.lat, lng: location.lng };
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: pos,
          zoom: 15,
          mapTypeId: 'roadmap',
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0d1f3c' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1f3c' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#c9a227' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2b4a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08152b' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });
        markerRef.current = new window.google.maps.Marker({
          position: pos,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#c9a227',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });
      } else {
        googleMapRef.current.panTo(pos);
        markerRef.current?.setPosition(pos);
      }
    }
    if (window.google?.maps) {
      tryInit();
    } else {
      const check = setInterval(() => {
        if (window.google?.maps) { clearInterval(check); tryInit(); }
      }, 300);
    }
  }, [location]);

  // ── Contact handlers ───────────────────────────────────────────────
  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts((prev) => [...prev, { name: '', phone: '', email: '', relationship: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return;
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userId) return;
    const valid = contacts.every((c) => c.name.trim() && c.email.trim());
    if (!valid) { setError('Each contact needs a name and email.'); return; }
    if (!panicPhrase.trim()) { setError('Please set a panic phrase.'); return; }
    setError('');
    setSaving(true);
    try {
      const existing = await getSafetyProfile(userId);
      await saveSafetyProfile({
        agentId: userId,
        agentName: existing?.agentName || '',
        agentEmail: existing?.agentEmail || '',
        agentPhone: existing?.agentPhone || '',
        emergencyContacts: contacts,
        panicPhrase: panicPhrase.trim(),
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  // ── Copy tracking link ─────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="min-h-screen bg-[#08152b] pb-12" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div className="bg-[#0d1f3c] border-b border-[#c9a227]/30 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/showing-shield/dashboard')}
          className="text-[#c9a227] hover:text-white font-bold text-lg leading-none transition"
          aria-label="Back"
        >
          &larr;
        </button>
        <div className="w-10 h-10 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#08152b] text-sm">
          SS
        </div>
        <div>
          <p className="font-bold text-white text-sm">Safety Setup</p>
          <p className="text-[#c9a227]/80 text-xs">Emergency contacts & panic phrase</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Live map */}
        <div className="rounded-2xl overflow-hidden border border-[#c9a227]/20">
          <div className="bg-[#0d1f3c] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">Your Live Location</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {location ? location.address : 'Detecting location...'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span className="text-emerald-400 text-xs font-semibold">LIVE</span>
            </div>
          </div>
          <div ref={mapRef} style={{ height: '220px', width: '100%', background: '#0d1f3c' }} />
        </div>

        {/* Tracking link */}
        <div className="bg-[#0d1f3c] rounded-2xl border border-[#c9a227]/20 px-4 py-4 space-y-3">
          <div>
            <p className="text-white text-sm font-semibold">Your Tracking Link</p>
            <p className="text-gray-400 text-xs mt-1">
              Share this with family or emergency contacts. They can watch your location anytime — no login required.
            </p>
          </div>
          <div className="bg-[#08152b] rounded-xl px-3 py-2.5 flex items-center gap-2">
            <p className="text-[#c9a227] text-xs font-mono flex-1 truncate">{trackingLink}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${copied ? 'bg-emerald-600 text-white' : 'bg-[#c9a227] text-[#08152b] hover:bg-[#d4ad2e]'}`}
          >
            {copied ? 'Copied! ✓' : 'Copy Tracking Link'}
          </button>
        </div>

        {/* Emergency contacts */}
        <div className="space-y-3">
          <div>
            <p className="text-white text-sm font-semibold">Emergency Contacts</p>
            <p className="text-gray-400 text-xs mt-1">Up to 3 contacts. All will receive an email alert when panic is triggered.</p>
          </div>
          {contacts.map((contact, index) => (
            <div key={index} className="bg-[#0d1f3c] rounded-2xl border border-white/10 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[#c9a227] text-xs font-semibold uppercase tracking-wide">
                  Contact {index + 1}
                </p>
                {contacts.length > 1 && (
                  <button
                    onClick={() => removeContact(index)}
                    className="text-gray-500 hover:text-red-400 text-xs transition"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Full name *"
                value={contact.name}
                onChange={(e) => updateContact(index, 'name', e.target.value)}
                className="w-full bg-[#08152b] text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a227]/60"
              />
              <input
                type="email"
                placeholder="Email address *"
                value={contact.email}
                onChange={(e) => updateContact(index, 'email', e.target.value)}
                className="w-full bg-[#08152b] text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a227]/60"
              />
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={contact.phone}
                onChange={(e) => updateContact(index, 'phone', e.target.value)}
                className="w-full bg-[#08152b] text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a227]/60"
              />
            </div>
          ))}
          {contacts.length < 3 && (
            <button
              onClick={addContact}
              className="w-full py-3 rounded-2xl border border-dashed border-[#c9a227]/30 text-[#c9a227] text-sm font-semibold hover:border-[#c9a227]/60 transition"
            >
              + Add Another Contact
            </button>
          )}
        </div>

        {/* Panic phrase */}
        <div className="bg-[#0d1f3c] rounded-2xl border border-white/10 px-4 py-4 space-y-3">
          <div>
            <p className="text-white text-sm font-semibold">Silent Panic Phrase</p>
            <p className="text-gray-400 text-xs mt-1">
              Type this phrase in the chat during a session to silently trigger an emergency alert. Choose something natural that won't raise suspicion.
            </p>
          </div>
          <input
            type="text"
            placeholder='e.g. "I need to reschedule"'
            value={panicPhrase}
            onChange={(e) => setPanicPhrase(e.target.value)}
            className="w-full bg-[#08152b] text-white placeholder-gray-500 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a227]/60"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-2xl text-base font-bold transition ${saved ? 'bg-emerald-600 text-white' : 'bg-[#c9a227] text-[#08152b] hover:bg-[#d4ad2e]'} disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Safety Profile'}
        </button>

      </div>
    </div>
  );
}
