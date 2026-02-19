"use client";
export const dynamic = "force-dynamic";

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import Tab1PropertyBasics from './tabs/tab1';
import Tab2Neighborhood from './tabs/tab2';
import Tab3Listing from './tabs/tab3';
import Tab4Checklist from './tabs/tab4';
import Tab5Save from './tabs/tab5';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState(1);
  const [address, setAddress] = useState('');
  const [propertyData, setPropertyData] = useState({
    taxId: '', yearBuilt: '', beds: '', baths: '',
    sqft: '', lotSize: '', price: '', features: '',
  });
  const [nearby, setNearby] = useState<any>(null);
  const [listing, setListing] = useState('');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const tabs = [
    { num: 1, label: 'Property Basics', icon: '🏠', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon: '📍', done: !!nearby },
    { num: 3, label: 'AI Listing', icon: '✨', done: !!listing },
    { num: 4, label: 'Documents & Checklist', icon: '✅', done: false },
    { num: 5, label: 'Save to Vault', icon: '💾', done: saved },
  ];

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏠 Agent Workspace</h1>
          <p className="text-gray-300 text-lg">Your complete pre-listing command center</p>
        </div>
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
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                activeTab === tab.num
                  ? 'bg-[#c9a227] text-white shadow-lg'
                  : tab.done
                  ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                  : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
              }`}
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
        {activeTab === 5 && <Tab5Save address={address} propertyData={propertyData} nearby={nearby} listing={listing} checklistState={checklistState} notes={notes} saved={saved} setSaved={setSaved} user={user} onSave={() => setShowAuthModal(true)} />}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={(user) => setUser(user)} />
    </main>
  );
}
