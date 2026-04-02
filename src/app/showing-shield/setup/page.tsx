'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getSafetyProfile, saveSafetyProfile, EmergencyContact } from '@/lib/showingShield';

const emptyContact = (): EmergencyContact => ({
  name: '',
  phone: '',
  email: '',
  relationship: '',
});

export default function ShowingShieldSetup() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [agentPhone, setAgentPhone] = useState('');
  const [panicPhrase, setPanicPhrase] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([emptyContact()]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/signin'); return; }
      setUser(u);
      const profile = await getSafetyProfile(u.uid);
      if (profile) {
        setAgentPhone(profile.agentPhone || '');
        setPanicPhrase(profile.panicPhrase || '');
        setContacts(profile.emergencyContacts?.length ? profile.emergencyContacts : [emptyContact()]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts((prev) => [...prev, emptyContact()]);
  };

  const removeContact = (index: number) => {
    if (contacts.length === 1) return;
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!agentPhone) { setError('Your phone number is required.'); return; }
    if (contacts.some((c) => !c.name || !c.email)) {
      setError('Each contact must have a name and email address.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveSafetyProfile({
        agentId: user.uid,
        agentName: user.displayName || user.email,
        agentEmail: user.email,
        agentPhone,
        panicPhrase: panicPhrase || 'I need to reschedule',
        emergencyContacts: contacts,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => router.push('/showing-shield/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
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
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <p className="text-[#c9a227] font-semibold uppercase tracking-widest text-xs mb-2">Showing Shield</p>
          <h1 className="text-3xl font-bold text-white mb-2">Safety Profile Setup</h1>
          <p className="text-gray-400">Configure your emergency contacts and panic phrase. These are used when an alert is triggered.</p>
        </div>

        {/* Mobile/Tablet Device Notice */}
        <div className="bg-blue-900/40 border border-blue-500/40 rounded-2xl p-5 flex gap-4 items-start mb-6">
          <span className="text-2xl flex-shrink-0">📱</span>
          <div>
            <p className="text-blue-200 font-bold text-sm mb-1">Important — Mobile or Tablet Required</p>
            <p className="text-blue-300/80 text-xs leading-relaxed">
              Showing Shield must be used on a GPS-enabled device — smartphone, iPhone, iPad, or Android tablet.
              Once setup is complete, open the dashboard on your mobile device and <strong>add it to your home screen</strong> for one-tap access at every showing.
              Location tracking and camera evidence capture require a mobile device with GPS.
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Agent Phone */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">📱 Your Phone Number</h2>
            <p className="text-gray-400 text-sm mb-4">Included in alerts so contacts can call you back immediately.</p>
            <input
              type="tel"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
              placeholder="+1 (407) 555-0000"
              className="w-full bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
            />
          </div>

          {/* Panic Phrase */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">🔑 Silent Panic Phrase</h2>
            <p className="text-gray-400 text-sm mb-4">
              A normal-sounding phrase you type into the chat during a session to silently trigger the emergency alert.
              Default: <span className="text-[#c9a227]">"I need to reschedule"</span>
            </p>
            <input
              type="text"
              value={panicPhrase}
              onChange={(e) => setPanicPhrase(e.target.value)}
              placeholder="I need to reschedule"
              className="w-full bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
            />
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-1">🆘 Emergency Contacts</h2>
            <p className="text-gray-400 text-sm mb-6">Up to 3 contacts. All will receive an email alert when panic is triggered.</p>

            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#c9a227] font-bold">Contact {index + 1}</span>
                    {contacts.length > 1 && (
                      <button
                        onClick={() => removeContact(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Full name"
                      className="bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="+1 (407) 555-0000"
                      className="bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                    />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="Email (optional)"
                      className="bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                    />
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                      placeholder="Relationship (e.g. Broker)"
                      className="bg-[#1a2b4a] border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a227] text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {contacts.length < 3 && (
              <button
                onClick={addContact}
                className="mt-4 text-[#c9a227] hover:text-white text-sm font-semibold transition"
              >
                + Add Another Contact
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-900/60 border border-red-500/60 rounded-xl p-4 text-center">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {saved && (
            <div className="bg-emerald-900/60 border border-emerald-500/60 rounded-xl p-4 text-center">
              <p className="text-emerald-200 font-semibold">✅ Safety profile saved. Redirecting...</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#c9a227] to-[#e8c547] hover:from-[#b8911f] hover:to-[#d4b03c] text-[#08152b] font-bold py-4 rounded-xl text-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Safety Profile'}
          </button>

          <button
            onClick={() => router.push('/showing-shield/dashboard')}
            className="w-full text-gray-400 hover:text-white text-sm font-semibold transition text-center"
          >
            ← Back to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
}

   