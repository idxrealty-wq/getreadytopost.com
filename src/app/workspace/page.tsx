"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Listing } from '@/lib/listings';
import AuthModal from '@/components/AuthModal';
import Tab1PropertyBasics from './tabs/tab1';
import Tab2Neighborhood from './tabs/tab2';
import Tab3Listing from './tabs/tab3';
import Tab4Checklist from './tabs/tab4';
import Tab5Save from './tabs/tab5';

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [address, setAddress] = useState('');
  const [propertyData, setPropertyData] = useState({
    taxId: '', yearBuilt: '', beds: '', baths: '', legalDescription: '',
    sqft: '', lotSize: '', price: '', features: '', dateAdded: '',
  });
  const [nearby, setNearby] = useState<any>(null);
  const [listing, setListing] = useState('');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string; date: string }[]>>({});
  const [existingPhotos, setExistingPhotos] = useState<Array<any>>([]);
  const [existingDocuments, setExistingDocuments] = useState<Array<any>>([]);
  const [listingId, setListingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !editId && !listingId) {
      (async () => {
        try {
          const draftId = 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, 'listings', draftId), {
            id: draftId,
            userId: user.uid,
            status: 'draft',
            address: '',
            propertyData: { taxId: '', yearBuilt: '', beds: '', baths: '', sqft: '', lotSize: '', price: '', features: '', dateAdded: '', legalDescription: '' },
            nearby: null,
            aiListing: '',
            checklistState: {},
            notes: '',
            photos: [],
            documents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setListingId(draftId);
          router.replace('/workspace?edit=' + draftId);
        } catch (err) {
          console.error('Failed to create draft listing:', err);
        }
      })();
    }
  }, [user, editId, listingId]);

  useEffect(() => {
    if (editId && user && !loadingListing) {
      loadListingForEdit(editId);
    }
  }, [editId, user]);

  const loadListingForEdit = async (listingId: string) => {
    setListingId(listingId);
    setLoadingListing(true);
    try {
      const listingRef = doc(db, 'listings', listingId);
      const listingSnap = await getDoc(listingRef);
      if (listingSnap.exists()) {
        const data = listingSnap.data() as Listing;
        if (data.userId === user?.uid) {
          setAddress(data.address);
          setPropertyData({ ...data.propertyData, legalDescription: (data.propertyData as any).legalDescription || '' });
          setNearby(data.nearby);
          setListing(data.aiListing);
          setChecklistState(data.checklistState);
          setNotes(data.notes);
          setExistingPhotos(data.photos || []);
          setExistingDocuments(data.documents || []);
          setSaved(false);
        } else {
          alert('You do not have permission to edit this listing.');
        }
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
    { num: 4, label: 'Documents & Checklist', icon: '✅', done: false },
    { num: 5, label: 'Save to Vault', icon: '💾', done: saved },
  ];

  if (loadingListing) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading listing for editing...</div>
        </div>
      </main>
    );
  }

  return (
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
          <h1 className="text-4xl font-bold text-white mb-2">
            {editId ? '✏️ Edit Listing' : '🏠 Agent Workspace'}
          </h1>
          <p className="text-gray-300 text-lg">
            {editId ? 'Update your listing details' : 'Your complete pre-listing command center'}
          </p>
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
        {activeTab === 4 && <Tab4Checklist listingId={listingId} checklistState={checklistState} setChecklistState={setChecklistState} notes={notes} setNotes={setNotes} photos={photos} setPhotos={setPhotos} existingPhotos={existingPhotos} existingDocuments={existingDocuments} setExistingDocuments={setExistingDocuments} onNext={() => setActiveTab(5)} />}
        {activeTab === 5 && <Tab5Save address={address} propertyData={propertyData} nearby={nearby} listing={listing} checklistState={checklistState} notes={notes} saved={saved} setSaved={setSaved} user={user} editId={editId} photos={photos} existingPhotos={existingPhotos} documents={existingDocuments} existingDocuments={existingDocuments} />}
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
    </main>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading workspace...</div>
        </div>
      </main>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}

