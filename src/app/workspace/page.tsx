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
    { num: 1, label: 'Property', icon: '🏠', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon: '🗺️', done: !!nearby },
    { num: 3, label: 'AI Listing', icon: '✨', done: !!listing },
    { num: 4, label: 'Documents', icon: '📋', done: false },
    { num: 5, label: 'Save', icon: '💾', done: saved },
    { num: 6, label: 'Closing Costs', icon: '🧮', done: !!savedEstimate },
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
        {activeTab === 6 && (<Tab6ClosingCosts listingId={listingId} address={address} propertyData={propertyData} savedEstimate={savedEstimate} />)}
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
