'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  getSafetyProfile,
  getActiveSession,
  getSessionHistory,
  ShowingSession,
  AgentSafetyProfile,
} from '@/lib/showingShield';

function StatusBadge({ status }: { status: ShowingSession['status'] }) {
  const map = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    alert_triggered: 'bg-red-500/20 text-red-400 border-red-500/30',
    expired: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  const label = {
    active: '🟢 Active',
    completed: '✅ Completed',
    alert_triggered: '🚨 Alert Triggered',
    expired: '⚠️ Expired',
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export default function ShowingShieldDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AgentSafetyProfile | null>(null);
  const [activeSession, setActiveSession] = useState<ShowingSession | null>(null);
  const [history, setHistory] = useState<ShowingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [propertyAddress, setPropertyAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [duration, setDuration] = useState('60');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      const [p, active, hist] = await Promise.all([
        getSafetyProfile(u.uid),
        getActiveSession(u.uid),
        getSessionHistory(u.uid),
      ]);
      setProfile(p);
      setActiveSession(active);
      setHistory(hist.filter((s) => s.status !== 'active'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStartSession = async () => {
    if (!user) return;
    if (!propertyAddress || !clientName) {
      setStartError('Property address and client name are required.');
      return;
    }
    if (!profile) {
      setStartError('You must set up your safety profile before starting a session.');
      return;
    }

    setStarting(true);
    setStartError('');

    try {
      const res = await fetch('/api/showing-shield/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: user.uid,
          agentName: user.displayName || user.email,
          agentEmail: user.email,
          agentPhone: profile.agentPhone,
          propertyAddress,
          clientName,
          scheduledDuration: parseInt(duration),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStartError(data.error || 'Failed to start session.');
        setStarting(false);
        return;
      }

      router.push(`/showing-shield/session?id=${data.sessionId}`);
    } catch {
      setStartError('Network error. Please try again.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08152b] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08152b] pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#c9a227] font-semibold uppercase tracking-widest text-xs mb-1">Showing Shield</p>
            <h1 className="text-3xl font-bold text-white">Safety Dashboard</h1>
          </div>
          <button
            onClick={() => router.push('/showing-shield/setup')}
            className="text-sm text-gray-400 hover:text-[#c9a227] font-semibold transition"
          >
            ⚙️ Setup
          </button>
        </div>

        {/* Mobile/Tablet Device Notice */}
        <div className="bg-blue-900/40 border border-blue-500/40 rounded-2xl p-5 flex gap-4 items-start">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div>
            <p className="text-blue-200 font-bold text-sm mb-1">Use This on Your Phone or Tablet</p>
            <p className="text-blue-300/80 text-xs leading-relaxed">
              Showing Shield requires a GPS-enabled device with a camera — smartphone, iPhone, iPad, or Android tablet.
              Open this page on your mobile device and <strong>add it to your home screen</strong> for instant access at every showing.
              Location tracking and evidence capture will not work on a desktop computer.
            </p>
          </div>
        </div>

        {/* Profile Status */}
        {!profile ? (
          <div className="bg-yellow-900/40 border border-yellow-500/40 rounded-2xl p-6 text-center">
            <p className="text-yellow-300 font-bold text-lg mb-2">⚠️ Safety Profile Not Configured</p>
            <p className="text-gray-400 text-sm mb-4">You need to add emergency contacts before starting a session.</p>
            <button
              onClick={() => router.push('/showing-shield/setup')}
              className="bg-[#c9a227] hover:bg-[#b8911f] text-[#08152b] font-bold px-6 py-3 rounded-xl transition"
            >
              Set Up Now
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">✅ Safety Profile Active</p>
                <p className="text-gray-400 text-sm mt-1">
                  {profile.emergencyContacts.length} emergency contact{profile.emergencyContacts.length !== 1 ? 's' : ''} configured
                </p>
              </div>
              <button
                onClick={() => router.push('/showing-shield/setup')}
                className="text-[#c9a227] hover:text-white text-sm font-semibold transition"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Active Session */}
        {activeSession ? (
          <div className="bg-emerald-900/40 border-2 border-emerald-500/40 rounded-2xl p-6">
            <p className="text-emerald-400 font-bold text-lg mb-1">🟢 Session In Progress</p>
            <p className="text-white font-semibold">{activeSession.propertyAddress}</p>
            <p className="text-gray-400 text-sm mt-1">Client: {activeSession.clientName}</p>
            <p className="text-gray-400 text-sm">Started: {new Date(activeSession.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <button
              onClick={() => router.push(`/showing-shield/session?id=${activeSession.id}`)}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition"
            >
              Return to Active Session →
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">🏠 Start New Showing</h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  disabled={!profile}
                  className="bg-[#c9a227] hover:bg-[#b8911f] text-[#08152b] font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-40"
                >
                  + New Session
                </button>
              )}
            </div>

            {showForm && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Property address"
                  className="w-full bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                  className="w-full bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">2 hours</option>
                </select>

                {startError && (
                  <p className="text-red-400 text-sm">{startError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleStartSession}
                    disabled={starting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {starting ? 'Starting...' : '🛡️ Start Protected Session'}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setStartError(''); }}
                    className="px-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showForm && (
              <p className="text-gray-500 text-sm">No active session. Start one before your next showing.</p>
            )}
          </div>
        )}

        {/* Session History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4">📋 Session History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No past sessions yet.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((s) => (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{s.propertyAddress}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Client: {s.clientName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}{s.scheduledDuration} min
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/showing-shield')}
          className="w-full text-gray-500 hover:text-white text-sm font-semibold transition text-center"
        >
          ← Back to Showing Shield
        </button>

      </div>
    </div>
  );
}
