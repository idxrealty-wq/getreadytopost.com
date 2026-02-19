"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '@/components/AuthModal';
import type { Listing } from '@/lib/listings';
import Tab1PropertyBasics from './tabs/tab1';
import Tab2Neighborhood from './tabs/tab2';
import Tab3Listing from './tabs/tab3';
import Tab4Checklist from './tabs/tab4';
import Tab5Save from './tabs/tab5';

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
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
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string; date: string }[]>>({});
  const [existingPhotos, setExistingPhotos] = useState<Array<{ url: string; category: string; uploadedAt: string }>>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editId && user && !loadingListing) {
      loadListingForEdit(editId);
    }
  }, [editId, user]);

  const loadListingForEdit = async (id: string) => {
    try {
      setLoadingListing(true);
      const docRef = doc(db, 'listings', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Listing;
        if (data.userId !== user?.uid) {
          alert('You do not have permission to edit this listing.');
          return;
        }
        setAddress(data.address || '');
        setPropertyData(data.propertyData || {});
        setNearby(data.nearby || null);
        setListing(data.aiListing || '');
        setChecklistState(data.checklistState || {});
        setNotes(data.notes || '');
        setExistingPhotos(data.photos || []);
        setSaved(false);
      } else {
        alert('Listing not found.');
      }
    } catch (err: any) {
      alert('Failed to load listing: ' + err.message);
    } finally {
      setLoadingListing(false);
    }
  };

  const tabs = [
    { num: 1, label: 'Property Basics', icon: '🏠', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon: '📍', done: !!nearby },
    { num: 3, label: 'AI Listing', icon: '✨', done: !!listing },
    { num: 4, label: 'Documents', icon: '✅', done: false },
    { num: 5, label: 'Save to Vault', icon: '💾', done: saved },
  ];

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Agent Workspace</h1>
          <p className="text-gray-300">Build, refine, and save your property listings</p>
          {editId && <p className="text-sm text-yellow-300 mt-2">Editing listing: {editId}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.num}
                onClick={() => setActiveTab(tab.num)}
                className={`flex-1 px-6 py-4 font-bold transition ${
                  activeTab === tab.num
                    ? 'bg-[#c9a227] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {tab.icon} {tab.num}. {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {!authLoading ? (
              <>
                {activeTab === 1 && (
                  <Tab1PropertyBasics
                    data={propertyData}
                    setData={setPropertyData}
                    onNext={() => setActiveTab(2)}
                    address={address}
                  />
                )}
                {activeTab === 2 && (
                  <Tab2Neighborhood
                    address={address}
                    nearby={nearby}
                    setNearby={setNearby}
                    onNext={() => setActiveTab(3)}
                  />
                )}
                {activeTab === 3 && (
                  <Tab3Listing
                    address={address}
                    propertyData={propertyData}
                    nearby={nearby}
                    listing={listing}
                    setListing={setListing}
                    onNext={() => setActiveTab(4)}
                  />
                )}
                {activeTab === 4 && (
                  <Tab4Checklist
                    checklistState={checklistState}
                    setChecklistState={setChecklistState}
                    notes={notes}
                    setNotes={setNotes}
                    photos={photos}
                    setPhotos={setPhotos}
                    existingPhotos={existingPhotos}
                    onNext={() => setActiveTab(5)}
                  />
                )}
                {activeTab === 5 && (
                  <Tab5Save
                    address={address}
                    propertyData={propertyData}
                    nearby={nearby}
                    listing={listing}
                    checklistState={checklistState}
                    notes={notes}
                    saved={saved}
                    setSaved={setSaved}
                    user={user}
                    editId={editId}
                    photos={photos}
                    existingPhotos={existingPhotos}
                    onSave={() => setShowAuthModal(true)}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-white text-xl">Loading workspace...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setShowAuthModal(false);
        }}
      />
    </main>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <div className="text-white text-xl">Loading workspace...</div>
          </div>
        </main>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
