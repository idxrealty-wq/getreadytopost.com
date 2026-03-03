"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Listing } from '@/lib/listings';
import AuthModal from '@/components/AuthModal';
import Tab1PropertyBasics from './tabs/tab1';
import CSVImport from './tabs/csv-import';
import AddressAutosuggest from '@/components/AddressAutosuggest';
import Tab2Neighborhood from './tabs/tab2';
import Tab3Listing from './tabs/tab3';
import Tab4Checklist from './tabs/tab4';
import Tab5Save from './tabs/tab5';
import Tab6ClosingCosts from './tabs/tab6';

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
    taxId: '', yearBuilt: '', beds: '', baths: '', legalDescription: '', propertyType: '',
    zoning: '', stories: '', garage: '', pool: '', construction: '', schoolDistrict: '',
    hoa: '', hoaAmount: '', hoaName: '', amenities: '', floodZone: '', water: '', sewer: '',
    roofYear: '', acYear: '', waterHeaterYear: '', assessedValue: '', lastSalePrice: '',
    lastSaleYear: '', homestead: '', sqft: '', lotSize: '', price: '', features: '', dateAdded: '',
  });
  const [nearby, setNearby] = useState<any>(null);
  const [listing, setListing] = useState('');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [documentAccessCode, setDocumentAccessCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveNowNonce, setSaveNowNonce] = useState(0);
  const [photos, setPhotos] = useState<Record<string, { file: File; preview: string; date: string }[]>>({});
  const [existingPhotos, setExistingPhotos] = useState<Array<any>>([]);
  const [existingDocuments, setExistingDocuments] = useState<Array<any>>([]);
  const [listingId, setListingId] = useState<string | null>(null);
  const [savedEstimate, setSavedEstimate] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !editId && !listingId) {
      const draftId = 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setListingId(draftId);
      router.replace('/workspace?edit=' + draftId);
    }
  }, [user, editId, listingId]);

  useEffect(() => {
    if (editId && user && !loadingListing) {
      loadListingForEdit(editId);
    }
  }, [editId, user]);

  const loadListingForEdit = async (id: string) => {
    setListingId(id);
  useEffect(() => {
    const saved = localStorage.getItem("grtp_property");
    if (saved && !editId) {
      try {
        const p = JSON.parse(saved);
        if (p.address) setAddress(p.address);
        if (p.beds || p.baths || p.sqft || p.yearBuilt || p.price || p.hoa) {
          setPropertyData((prev: any) => ({
            ...prev,
            beds: p.beds || prev.beds,
            baths: p.baths || prev.baths,
            sqft: p.sqft || prev.sqft,
            yearBuilt: p.yearBuilt || prev.yearBuilt,
            price: p.price || prev.price,
            hoa: p.hoa || prev.hoa,
            hoaAmount: p.hoaAmount || prev.hoaAmount,
          }));
        }
        localStorage.removeItem("grtp_property");
      } catch(e) { console.error("Failed to load grtp_property", e); }
    }
  }, [editId]);
    setLoadingListing(true);
    try {
      const listingRef = doc(db, 'listings', id);
      const listingSnap = await getDoc(listingRef);
      if (listingSnap.exists()) {
        const data = listingSnap.data() as Listing;
        if (data.userId === user?.uid) {
          setAddress(data.address);
          setPropertyData({
            ...data.propertyData,
            legalDescription: (data.propertyData as any).legalDescription || '',
            propertyType: (data.propertyData as any).propertyType || '',
            zoning: (data.propertyData as any).zoning || '',
            stories: (data.propertyData as any).stories || '',
            garage: (data.propertyData as any).garage || '',
            pool: (data.propertyData as any).pool || '',
            construction: (data.propertyData as any).construction || '',
            schoolDistrict: (data.propertyData as any).schoolDistrict || '',
            hoa: (data.propertyData as any).hoa || '',
            hoaAmount: (data.propertyData as any).hoaAmount || '',
            hoaName: (data.propertyData as any).hoaName || '',
            amenities: (data.propertyData as any).amenities || '',
            floodZone: (data.propertyData as any).floodZone || '',
            water: (data.propertyData as any).water || '',
            sewer: (data.propertyData as any).sewer || '',
            roofYear: (data.propertyData as any).roofYear || '',
            acYear: (data.propertyData as any).acYear || '',
            waterHeaterYear: (data.propertyData as any).waterHeaterYear || '',
            assessedValue: (data.propertyData as any).assessedValue || '',
            lastSalePrice: (data.propertyData as any).lastSalePrice || '',
            lastSaleYear: (data.propertyData as any).lastSaleYear || '',
            homestead: (data.propertyData as any).homestead || '',
          });
          setNearby(data.nearby);
          setListing(data.aiListing);
          setChecklistState(data.checklistState);
          setNotes(data.notes);
          setExistingPhotos(data.photos || []);
          setExistingDocuments(data.documents || []);
          setSavedEstimate((data as any).closingCostEstimate || null);
          setSaved(false);
        } else {
          alert('You do not have permission to edit this listing.');
        }
      }
    } catch (err: any) {
      console.error('Failed to load listing:', err);
    } finally {
      setLoadingListing(false);
    }
  };

  const handleCSVImport = (imported: any) => {
    if (!address) setAddress(imported.address);
    setPropertyData((prev: any) => {
      const merged: any = { ...prev };
      const incoming = imported.propertyData || {};
      Object.keys(incoming).forEach((key) => {
        if (!prev[key] || prev[key] === '') merged[key] = incoming[key];
      });
      return merged;
    });
  };

  const tabs = [
    { num: 1, label: 'Property', icon: 'ðŸ ', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon: 'ðŸ—ºï¸', done: !!nearby },
    { num: 3, label: 'AI Listing', icon: 'âœ¨', done: !!listing },
    { num: 4, label: 'Documents', icon: 'ðŸ“‹', done: false },
    { num: 5, label: 'Save', icon: 'ðŸ’¾', done: saved },
    { num: 6, label: 'Closing Costs', icon: 'ðŸ§®', done: !!savedEstimate },
  ];

  if (loadingListing) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading listing...</div>
        </div>
      </main>
    );
  }
  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/421a46ef-b52d-44e1-b33d-bf1d1492c0cd/image.png?w=1200&h=896" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1a2b4a]/85"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{editId ? 'Edit Listing' : 'Agent Workspace'}</h1>
          <p className="text-gray-300 text-lg">{editId ? 'Update your listing details' : 'Your complete pre-listing command center'}</p>
        </div>
        {!authLoading && !user && (
          <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 border-2 border-red-500/60 rounded-2xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
            <p className="text-gray-200 text-lg mb-4">You must be signed in to save your work.</p>
            <button onClick={() => setShowAuthModal(true)} className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition">Sign In / Create Account</button>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <AddressAutosuggest
            value={address}
            onChange={setAddress}
            onSelect={(parcel) => {
              setPropertyData((prev) => ({
                ...prev,
                taxId: prev.taxId || parcel.parcel_id || '',
                yearBuilt: prev.yearBuilt || parcel.year_built || '',
                sqft: prev.sqft || parcel.sqft || '',
                beds: prev.beds || parcel.beds || '',
                lotSize: prev.lotSize || parcel.land_sqft || '',
                assessedValue: prev.assessedValue || parcel.just_value || '',
                lastSalePrice: prev.lastSalePrice || parcel.sale_price || '',
                lastSaleYear: prev.lastSaleYear || parcel.sale_year || '',
                baths: prev.baths || parcel.baths || '',
                propertyType: prev.propertyType || parcel.property_type || '',
                zoning: prev.zoning || parcel.zoning || '',
                homestead: prev.homestead || parcel.homestead || '',
                propertyLink: (prev as any).propertyLink || parcel.property_link || '',
                legalDescription: prev.legalDescription || parcel.legal_description || '',
                ownerName: (prev as any).ownerName || parcel.owner_name || '',
              }));
            }}
          />
        </div>
        <div className="flex justify-end mb-4">
          <button onClick={() => { setSaveNowNonce(n => n + 1); setTimeout(() => window.open("/agent-vault", "_blank"), 600); }} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition">
            View in Vault
          </button>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.num} onClick={() => setActiveTab(tab.num)} className={'flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs transition whitespace-nowrap ' + (activeTab === tab.num ? 'bg-[#c9a227] text-white shadow-lg' : tab.done ? 'bg-green-600/30 text-green-300 border border-green-500/40' : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20')}>
              <span className="text-lg">{tab.done && activeTab !== tab.num ? 'âœ…' : tab.icon}</span>
              <span>{tab.num}. {tab.label}</span>
            </button>
          ))}
        </div>
        {activeTab === 1 && (<><CSVImport onImport={handleCSVImport} /><Tab1PropertyBasics data={propertyData} setData={setPropertyData} onNext={() => setActiveTab(2)} address={address} /></>)}
        {activeTab === 2 && (<Tab2Neighborhood address={address} nearby={nearby} setNearby={setNearby} onNext={() => setActiveTab(3)} />)}
        {activeTab === 3 && (<Tab3Listing address={address} propertyData={propertyData} nearby={nearby} listing={listing} setListing={setListing} onNext={() => setActiveTab(4)} />)}
        {activeTab === 4 && (
          <Tab4Checklist
            listingId={listingId}
            checklistState={checklistState}
            setChecklistState={setChecklistState}
            notes={notes}
            setNotes={setNotes}
            photos={photos}
            setPhotos={setPhotos}
            existingPhotos={existingPhotos}
            existingDocuments={existingDocuments}
            setExistingDocuments={setExistingDocuments}
            onNext={() => setActiveTab(5)}
            documentAccessCode={documentAccessCode}
            setDocumentAccessCode={setDocumentAccessCode}
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
            documents={existingDocuments}
            existingDocuments={existingDocuments}
            documentAccessCode={documentAccessCode}
            saveNowNonce={saveNowNonce}
          />
        )}
        {activeTab === 6 && (
          <Tab6ClosingCosts
            listingId={listingId}
            address={address}
            propertyData={propertyData}
            savedEstimate={savedEstimate}
          />
        )}
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
