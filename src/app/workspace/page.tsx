"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/auth-modal';
import Tab1PropertyBasics from './tabs/tab1';
import Tab2Neighborhood from './tabs/tab2';
import Tab3Listing from './tabs/tab3';
import Tab4Checklist from './tabs/tab4';
import Tab5Save from './tabs/tab5';

export default function WorkspacePage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState(1);
  const [address, setAddress] = useState('');
  const [propertyData, setPropertyData] = useState({
    taxId: '', yearBuilt: '', beds: '', baths: '',
    sqft: '', lotSize: '', price: '', features: '', dateAdded: '',
  });
  const [nearby, setNearby] = useState<any>(null);
  const [listing, setListing] = useState('');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { num: 1, label: 'Property Basics', icon: '🏠', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon: '📍', done: !!nearby },
    { num: 3, label: 'AI Listing', icon: '✨', done: !!listing },
    { num: 4, label: 'Documents & Checklist', icon: '✅', done: false },
    { num: 5, label: 'Save to Vault', icon: '💾', done: saved },
  ];

  return (
    <>
      <main className="pt-20 min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img
            src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/421a46ef-b52d-44e1-b33d-bf1d1492c0cd/image.png?w=1200&h=896"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🏠 Agent Workspace</h1>
            <p className="text-gray-300 text-lg">Your complete pre-listing command center</p>
          </div>

          {!authLoading && !user && (
            <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 border-2 border-red-500/60 rounded-2xl p-6 mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">⚠️ Sign In Required</h2>
              <p className="text-gray-200 text-lg mb-4">
                You must be signed in to save your work. Without an account, all data will be lost when you leave this page.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition"
              >
                Sign In / Create Account
              </button>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#c9a227] focus:outline-none text-lg"
            />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.num}
                onClick={() => setActiveTab(tab.num)}
                className={'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap ' + (
                  activeTab === tab.num
                    ? 'bg-[#c9a227] text-white shadow-lg'
                    : tab.done
                    ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                    : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                )}
              >
                <span className="text-lg">{tab.done && activeTab !== tab.num ? '✅' : tab.icon}</span>
                <span>{tab.num}. {tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 1 && <Tab1PropertyBasics data={propertyData} setData={setPropertyData} onNext={() => setActiveTab(2)} address={address} />}
          {activeTab === 2 && <Tab2Neighborhood address={address} nearby={nearby} setNearby={setNearby} onNext={() => setActiveTab(3)} />}
          {activeTab === 3 && <Tab3Listing address={address} propertyData={propertyData} nearby={nearby} listing={listing} setListing={setListing} onNext={() => setActiveTab(4)} />}
          {activeTab === 4 && <Tab4Checklist checklistState={checklistState} setChecklistState={setChecklistState} notes={notes} setNotes={setNotes} onNext={() => setActiveTab(5)} />}
          {activeTab === 5 && <Tab5Save address={address} propertyData={propertyData} nearby={nearby} listing={listing} checklistState={checklistState} notes={notes} saved={saved} setSaved={setSaved} user={user} />}
        </div>
      </main>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
