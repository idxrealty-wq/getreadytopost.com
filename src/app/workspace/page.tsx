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
  const [searchState, setSearchState] = useState('Florida');
  const [searchCityZip, setSearchCityZip] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchZip, setSearchZip] = useState('');

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
      (async () => {
        try {
          const draftId = 'listing_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, 'listings', draftId), {
            id: draftId,
            userId: user.uid,
            status: 'draft',
            address: '',
            propertyData: {
              taxId: '', yearBuilt: '', beds: '', baths: '', sqft: '', lotSize: '', price: '',
              features: '', dateAdded: '', legalDescription: '', propertyType: '', zoning: '',
              stories: '', garage: '', pool: '', construction: '', schoolDistrict: '', hoa: '',
              hoaAmount: '', hoaName: '', amenities: '', floodZone: '', water: '', sewer: '',
              roofYear: '', acYear: '', waterHeaterYear: '', assessedValue: '', lastSalePrice: '',
              lastSaleYear: '', homestead: ''
            },
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
      } else {
        alert('Listing not found.');
      }
    } catch (err: any) {
      alert('Failed to load listing: ' + err.message);
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
        if (!prev[key] || prev[key] === '') {
          merged[key] = incoming[key];
        }
      });
      return merged;
    });
  };

  const tabs = [
    { num: 1, label: 'Property', icon:'[1]', done: !!address && !!propertyData.taxId },
    { num: 2, label: 'Neighborhood', icon:'[2]', done: !!nearby },
    { num: 3, label: 'AI Listing', icon:'[3]', done: !!listing },
    { num: 4, label: 'Documents', icon:'[4]', done: false },
    { num: 5, label: 'Save', icon:'[5]', done: saved },
    { num: 6, label: 'Closing Costs', icon:'[6]', done: !!savedEstimate },
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
            {editId ? 'Edit Listing' : 'Agent Workspace'}
          </h1>
          <p className="text-gray-300 text-lg">
            {editId ? 'Update your listing details' : 'Your complete pre-listing command center'}
          </p>
        </div>

        {!authLoading && !user && (
          <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 border-2 border-red-500/60 rounded-2xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
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
        <div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-gray-300 text-sm font-bold mb-2">State</label>
    <select
      value={searchState}
      onChange={(e) => setSearchState(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-white text-gray-900"
    >
      <option value="Florida">Florida</option>
      <option value="Alabama">Alabama</option>
      <option value="Alaska">Alaska</option>
      <option value="Arizona">Arizona</option>
      <option value="Arkansas">Arkansas</option>
      <option value="California">California</option>
      <option value="Colorado">Colorado</option>
      <option value="Connecticut">Connecticut</option>
      <option value="Delaware">Delaware</option>
      <option value="Georgia">Georgia</option>
      <option value="Hawaii">Hawaii</option>
      <option value="Idaho">Idaho</option>
      <option value="Illinois">Illinois</option>
      <option value="Indiana">Indiana</option>
      <option value="Iowa">Iowa</option>
      <option value="Kansas">Kansas</option>
      <option value="Kentucky">Kentucky</option>
      <option value="Louisiana">Louisiana</option>
      <option value="Maine">Maine</option>
      <option value="Maryland">Maryland</option>
      <option value="Massachusetts">Massachusetts</option>
      <option value="Michigan">Michigan</option>
      <option value="Minnesota">Minnesota</option>
      <option value="Mississippi">Mississippi</option>
      <option value="Missouri">Missouri</option>
      <option value="Montana">Montana</option>
      <option value="Nebraska">Nebraska</option>
      <option value="Nevada">Nevada</option>
      <option value="New Hampshire">New Hampshire</option>
      <option value="New Jersey">New Jersey</option>
      <option value="New Mexico">New Mexico</option>
      <option value="New York">New York</option>
      <option value="North Carolina">North Carolina</option>
      <option value="North Dakota">North Dakota</option>
      <option value="Ohio">Ohio</option>
      <option value="Oklahoma">Oklahoma</option>
      <option value="Oregon">Oregon</option>
      <option value="Pennsylvania">Pennsylvania</option>
      <option value="Rhode Island">Rhode Island</option>
      <option value="South Carolina">South Carolina</option>
      <option value="South Dakota">South Dakota</option>
      <option value="Tennessee">Tennessee</option>
      <option value="Texas">Texas</option>
      <option value="Utah">Utah</option>
      <option value="Vermont">Vermont</option>
      <option value="Virginia">Virginia</option>
      <option value="Washington">Washington</option>
      <option value="West Virginia">West Virginia</option>
      <option value="Wisconsin">Wisconsin</option>
      <option value="Wyoming">Wyoming</option>
    </select>
  </div>
  <div>
    <label className="block text-gray-300 text-sm font-bold mb-2">City or ZIP</label>
    <input
      type="text"
      value={searchCityZip}
      onChange={(e) => {
        const v = e.target.value;
        setSearchCityZip(v);

        const trimmed = (v || "").trim();
        const zipMatch = trimmed.match(/\b\d{5}\b/);
        const looksLikeZip = /^\d{5}(-\d{4})?$/.test(trimmed) || !!zipMatch;

        if (looksLikeZip) {
          setSearchZip((zipMatch ? zipMatch[0] : trimmed).slice(0, 5));
          setSearchCity("");
        } else {
          setSearchCity(trimmed);
          setSearchZip("");
        }
      }}
      placeholder="e.g., Tavares or 32778"
      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-white text-gray-900"
    />
  </div>
</div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
         <AddressAutosuggest
  value={address}
  onChange={setAddress}
  onSelect={(parcel: any) => {
  setPropertyData((prev: any) => {
    const p = parcel || {};
	const v = (val: any) => val || '';
    return {
      ...prev,
	  address: prev.address || v(p.address),
      city: prev.city || v(p.city),
      zip: prev.zip || v(p.zip),
      parcelId: prev.parcelId || v(p.parcel_id),

      taxId: prev.taxId || v(p.parcel_id),
      yearBuilt: prev.yearBuilt || v(p.year_built),
      sqft: prev.sqft || v(p.sqft),
      beds: prev.beds || v(p.beds),
      baths: prev.baths || v(p.baths),
      lotSize: prev.lotSize || v(p.land_sqft),
      propertyType: prev.propertyType || v(p.property_type),
      zoning: prev.zoning || v(p.zoning),
      homestead: prev.homestead || v(p.homestead),
      legalDescription: prev.legalDescription || v(p.legal_description),
      ownerName: prev.ownerName || v(p.owner_name),
      owner2Name: prev.owner2Name || v(p.owner2_name),
      ownerType: prev.ownerType || v(p.owner_type),
      absenteeOwner: prev.absenteeOwner || v(p.absentee_owner),
      mailingAddress: prev.mailingAddress || v(p.mailing_address),
      assessedValue: prev.assessedValue || v(p.just_value),
      justValue: prev.justValue || v(p.just_value),
      landValue: prev.landValue || v(p.land_value),
      buildingValue: prev.buildingValue || v(p.building_value),
      taxableValue: prev.taxableValue || v(p.taxable_value),
      annualTax: prev.annualTax || v(p.annual_tax),
      taxYear: prev.taxYear || v(p.tax_year),
      lastSalePrice: prev.lastSalePrice || v(p.sale_price),
      saleDate: prev.saleDate || v(p.sale_date),
      saleTransType: prev.saleTransType || v(p.sale_trans_type),
      sellerName: prev.sellerName || v(p.seller_name),
      pricePerSqft: prev.pricePerSqft || v(p.price_per_sqft),
      deedType: prev.deedType || v(p.deed_type),
      titleCompany: prev.titleCompany || v(p.title_company),
      avmValue: prev.avmValue || v(p.avm_value),
      avmLow: prev.avmLow || v(p.avm_low),
      avmHigh: prev.avmHigh || v(p.avm_high),
      avmConfidence: prev.avmConfidence || v(p.avm_confidence),
      avmDate: prev.avmDate || v(p.avm_date),
      mortgageLender: prev.mortgageLender || v(p.mortgage_lender),
      mortgageAmount: prev.mortgageAmount || v(p.mortgage_amount),
      mortgageRate: prev.mortgageRate || v(p.mortgage_rate),
      mortgageType: prev.mortgageType || v(p.mortgage_type),
      mortgageTerm: prev.mortgageTerm || v(p.mortgage_term),
      mortgageDate: prev.mortgageDate || v(p.mortgage_date),
      dorUc: prev.dorUc || v(p.dor_uc),
      zoningCode: prev.zoningCode || v(p.zoning_code),
      subdivision: prev.subdivision || v(p.subdivision),
      lotNum: prev.lotNum || v(p.lot_num),
      acres: prev.acres || v(p.acres),
      garageSqft: prev.garageSqft || v(p.garage_sqft),
      fireplace: prev.fireplace || v(p.fireplace),
      wallType: prev.wallType || v(p.wall_type),
      condition: prev.condition || v(p.condition),
      roofCover: prev.roofCover || v(p.roof_cover),
      roofShape: prev.roofShape || v(p.roof_shape),
      improvementsYear: prev.improvementsYear || v(p.improvements_year),
      heatingType: prev.heatingType || v(p.heating_type),
      heatingFuel: prev.heatingFuel || v(p.heating_fuel),
      floodZone: prev.floodZone || v(p.flood_zone),
      floodSubtype: prev.floodSubtype || v(p.flood_subtype),
      floodSFHA: prev.floodSFHA || v(p.flood_sfha),
      schoolDistrict: prev.schoolDistrict || v(p.school_district),
      schoolDistrictType: prev.schoolDistrictType || v(p.school_district_type),
      schools: prev.schools || (p.schools ? p.schools : []),
      saleHistory: prev.saleHistory || (p.sale_history ? p.sale_history : []),
      assessmentHistory: prev.assessmentHistory || (p.assessment_history ? p.assessment_history : []),
      buildingPermits: prev.buildingPermits || (p.building_permits ? p.building_permits : []),
      propertyLink: prev.propertyLink || v(p.property_link),
      latitude: prev.latitude || v(p.latitude),
      longitude: prev.longitude || v(p.longitude),
    };
  });
}}

  state={searchState}
  city={searchCity}
  zip={searchZip}
/>


        </div>

        <div className="flex justify-between items-center mb-4">
          <div></div>
          <button
            onClick={() => { setSaveNowNonce(n => n + 1); setTimeout(() => window.open("/agent-vault", "_blank"), 600); }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            View in Vault
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.num}
              onClick={() => setActiveTab(tab.num)}
              className={'flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs transition whitespace-nowrap ' + (
                activeTab === tab.num
                  ? 'bg-[#c9a227] text-white shadow-lg'
                  : tab.done
                  ? 'bg-green-600/30 text-green-300 border border-green-500/40'
                  : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
              )}
            >
              <span className="text-lg">{tab.done && activeTab !== tab.num ? '[v]' : tab.icon}</span>
              <span>{tab.num}. {tab.label}</span>
            </button>
          ))}
        </div>
        {activeTab === 1 && (
          <>
            <CSVImport onImport={handleCSVImport} />
            <Tab1PropertyBasics data={propertyData} setData={setPropertyData} onNext={() => setActiveTab(2)} address={address} />
          </>
        )}
        {activeTab === 2 && (
          <Tab2Neighborhood address={address} nearby={nearby} setNearby={setNearby} onNext={() => setActiveTab(3)} />
        )}
        {activeTab === 3 && (
          <Tab3Listing address={address} propertyData={propertyData} nearby={nearby} listing={listing} setListing={setListing} onNext={() => setActiveTab(4)} />
        )}
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
          <Tab6ClosingCosts listingId={listingId} address={address} propertyData={propertyData} savedEstimate={savedEstimate} />
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
