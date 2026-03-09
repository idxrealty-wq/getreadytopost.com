"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { Listing } from "@/lib/listings";
import AuthModal from "@/components/AuthModal";
import Tab1PropertyBasics from "./tabs/tab1";
import CSVImport from "./tabs/csv-import";
import AddressAutosuggest from "@/components/AddressAutosuggest";
import Tab2Neighborhood from "./tabs/tab2";
import Tab3Listing from "./tabs/tab3";
import Tab4Checklist from "./tabs/tab4";
import Tab5Save from "./tabs/tab5";
import Tab6ClosingCosts from "./tabs/tab6";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loadingListing, setLoadingListing] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [address, setAddress] = useState("");
  const [searchState, setSearchState] = useState("Florida");
  const [searchCity, setSearchCity] = useState("");
  const [propertyData, setPropertyData] = useState({
    taxId: "",
    yearBuilt: "",
    beds: "",
    baths: "",
    legalDescription: "",
    propertyType: "",
    zoning: "",
    stories: "",
    garage: "",
    pool: "",
    construction: "",
    schoolDistrict: "",
    schools: [],
    hoa: "",
    hoaAmount: "",
    hoaName: "",
    amenities: "",
    floodZone: "",
    water: "",
    sewer: "",
    roofYear: "",
    acYear: "",
    waterHeaterYear: "",
    assessedValue: "",
    lastSalePrice: "",
    lastSaleYear: "",
    homestead: "",
    sqft: "",
    lotSize: "",
    price: "",
    features: "",
    dateAdded: "",
    propertyLink: "",
    ownerName: "",
    justValue: "",
    taxableValue: "",
    landValue: "",
    buildingValue: "",
    annualTax: "",
    taxYear: "",
    subdivision: "",
    cooling: "",
    fireplace: "",
    wallType: "",
    dor_uc: "",
    dataDate: "",
    latitude: "",
    longitude: "",
  });
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [droneUrl, setDroneUrl] = useState("");
  const [nearby, setNearby] = useState<any>(null);
  const [listing, setListing] = useState("");
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [documentAccessCode, setDocumentAccessCode] = useState("");
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
      const draftId = "listing_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      setListingId(draftId);
      router.replace("/workspace?edit=" + draftId);
    }
  }, [user, editId, listingId]);

  useEffect(() => {
    if (editId && user) {
      loadListingForEdit(editId);
    }
  }, [editId, user]);

  const loadListingForEdit = async (id: string) => {
    setListingId(id);
    setLoadingListing(true);
    try {
      const listingRef = doc(db, "listings", id);
      const listingSnap = await getDoc(listingRef);
      if (listingSnap.exists()) {
        const data = listingSnap.data() as Listing;
        if (data.userId === user?.uid) {
          setAddress(data.address);
          const pd: any = data.propertyData || {};
          setPropertyData({
            ...pd,
            beds: Number(pd.beds) || 0,
            baths: Number(pd.baths) || 0,
            sqft: Number(pd.sqft) || 0,
            lotSize: Number(pd.lotSize) || 0,
            price: Number(pd.price) || 0,
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
          alert("You do not have permission to edit this listing.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load listing:", err);
    } finally {
      setLoadingListing(false);
    }
  };

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
      } catch (e) {
        console.error("Failed to load grtp_property", e);
      }
    }
  }, []);

  const handleCSVImport = (imported: any) => {
    if (!address) setAddress(imported.address);
    setPropertyData((prev: any) => {
      const merged: any = { ...prev };
      const incoming = imported.propertyData || {};
      Object.keys(incoming).forEach((key) => {
        if (!prev[key] || prev[key] === "") merged[key] = incoming[key];
      });
      return merged;
    });
  };
  const handleParcelSelect = (parcel: any) => {
    setPropertyData((prev: any) => {
      const next: any = { ...prev };

      const setIfEmpty = (key: string, val: any) => {
        const cur = next[key];
        const curEmpty =
          cur === undefined ||
          cur === null ||
          String(cur).trim() === "" ||
          cur === 0;
        const v = val === undefined || val === null ? "" : String(val).trim();
        if (!v) return;
        if (curEmpty) next[key] = v;
      };

      // Core IDs / links
      setIfEmpty("taxId", parcel.parcel_id);
      setIfEmpty("propertyLink", parcel.property_link);

      // Core property facts
      setIfEmpty("yearBuilt", parcel.year_built);
      setIfEmpty("sqft", parcel.sqft);
      setIfEmpty("beds", parcel.beds);
      setIfEmpty("baths", parcel.baths);

      // Lot size: prefer land_sqft, else acres
      if (!next.lotSize || String(next.lotSize).trim() === "" || next.lotSize === 0) {
        const landSqft = String(parcel.land_sqft || "").trim();
        const acres = String(parcel.acres || "").trim();
        if (landSqft) next.lotSize = landSqft;
        else if (acres) next.lotSize = acres;
      }

      // Classification
      const normalizePropType = (v: string) => {
        if (!v) return '';
        const u = v.toUpperCase();
        if (u.includes('SINGLE') || u.includes('RESIDENTIAL') || u.includes('SFR')) return 'Single Family';
        if (u.includes('CONDO')) return 'Condo';
        if (u.includes('TOWN')) return 'Townhome';
        if (u.includes('MULTI') || u.includes('DUPLEX') || u.includes('TRIPLEX')) return 'Multi-Family';
        if (u.includes('LAND') || u.includes('VACANT') || u.includes('LOT')) return 'Land';
        if (u.includes('MOBILE') || u.includes('MANUFACTURED')) return 'Mobile Home';
        if (u.includes('COMMERCIAL') || u.includes('OFFICE') || u.includes('RETAIL') || u.includes('INDUSTRIAL')) return 'Commercial';
        return '';
      };
      setIfEmpty("propertyType", normalizePropType(parcel.property_type));
      setIfEmpty("zoning", parcel.zoning);

      // Legal / ownership
      setIfEmpty("legalDescription", parcel.legal_description);
      setIfEmpty("ownerName", parcel.owner_name);

      // Values / sales
      setIfEmpty("assessedValue", parcel.assessed_value || parcel.just_value);
      setIfEmpty("justValue", parcel.just_value);
      setIfEmpty("taxableValue", parcel.taxable_value);
      setIfEmpty("annualTax", parcel.annual_tax);
      setIfEmpty("taxYear", parcel.tax_year);
      setIfEmpty("landValue", parcel.land_value);
      setIfEmpty("buildingValue", parcel.building_value);
      setIfEmpty("lastSalePrice", parcel.sale_price);
      setIfEmpty("lastSaleYear", parcel.sale_year);

      // Homestead
      setIfEmpty("homestead", parcel.homestead);

      // Physical features — normalize to match dropdowns
      const normalizeConstruction = (v: string) => {
        if (!v) return '';
        const u = v.toUpperCase();
        if (u.includes('CONCRETE') || u.includes('CBS') || u.includes('BLOCK')) return 'CBS (Concrete Block)';
        if (u.includes('BRICK')) return 'Brick';
        if (u.includes('FRAME') || u.includes('WOOD')) return 'Frame';
        if (u.includes('STUCCO')) return 'Stucco';
        return 'Mixed';
      };
      const normalizeGarage = (v: string) => {
        if (!v) return '';
        const u = v.toUpperCase();
        if (u.includes('CARPORT')) return 'Carport';
        if (u.includes('3')) return '3-Car';
        if (u.includes('2')) return '2-Car';
        if (u.includes('1') || u.includes('SINGLE')) return '1-Car';
        if (u.includes('NONE') || u.includes('NO ')) return 'None';
        return '';
      };
      const normalizePool = (v: string) => {
        if (!v) return '';
        const u = v.toUpperCase();
        if (u.includes('SPA') || u.includes('HOT TUB')) return 'In-Ground + Spa';
        if (u.includes('ABOVE')) return 'Above-Ground';
        if (u.includes('YES') || u.includes('POOL') || u.includes('IN-GROUND')) return 'In-Ground';
        if (u.includes('NONE') || u.includes('NO')) return 'None';
        return '';
      };
      const normalizeStories = (v: string) => {
        if (!v) return '';
        if (v === '1') return '1';
        if (v === '2') return '2';
        if (Number(v) >= 3) return '3';
        return '';
      };

      setIfEmpty("construction", normalizeConstruction(parcel.construction));
      setIfEmpty("garage", normalizeGarage(parcel.garage));
      setIfEmpty("pool", normalizePool(parcel.pool));
      setIfEmpty("stories", normalizeStories(parcel.stories));
      setIfEmpty("subdivision", parcel.subdivision);
      setIfEmpty("cooling", parcel.cooling);
      setIfEmpty("fireplace", parcel.fireplace);
      setIfEmpty("wallType", parcel.wall_type);
      setIfEmpty("dor_uc", parcel.dor_uc);

      // ✅ Schools — always overwrite with fresh API data
      if (parcel.school_district) {
        next.schoolDistrict = parcel.school_district;
      }
      if (Array.isArray(parcel.schools) && parcel.schools.length > 0) {
        next.schools = parcel.schools.filter(
          (s: any) => s.name && !s.name.toLowerCase().includes('virtual')
        );
      }

      // ✅ Data freshness date
      if (parcel.last_modified) {
        next.dataDate = parcel.last_modified;
      }
	        // ✅ Homestead + exemptions
      setIfEmpty("homestead", parcel.homestead);
      setIfEmpty("exemptions", parcel.exemptions);
	  setIfEmpty("flood_zone", parcel.flood_zone);
      setIfEmpty("flood_subtype", parcel.flood_subtype);
      setIfEmpty("flood_sfha", parcel.flood_sfha);

	        // ✅ Geocodes for map
      if (parcel.latitude) next.latitude = parcel.latitude;
      if (parcel.longitude) next.longitude = parcel.longitude;
      return next;
    });

    // Update address
    const fullAddressParts = [parcel.address, parcel.city, parcel.zip].filter(Boolean);
    const fullAddress = fullAddressParts.join(", ");
    setAddress(fullAddress);
  };
  const tabs = [
    { num: 1, label: "Property", icon: "", done: !!address && !!propertyData.taxId },
    { num: 2, label: "Neighborhood", icon: "", done: !!nearby },
    { num: 3, label: "AI Listing", icon: "", done: !!listing },
    { num: 4, label: "Documents", icon: "", done: false },
    { num: 5, label: "Save", icon: "", done: saved },
    { num: 6, label: "Closing Costs", icon: "", done: !!savedEstimate },
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
            {editId ? "Edit Listing" : "Agent Workspace"}
          </h1>
          <p className="text-gray-300 text-lg">
            {editId ? "Update your listing details" : "Your complete pre-listing command center"}
          </p>
        </div>
        {!authLoading && !user && (
          <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 border-2 border-red-500/60 rounded-2xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
            <p className="text-gray-200 text-lg mb-4">You must be signed in to save your work.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-red-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition"
            >
              Sign In / Create Account
            </button>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
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
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="e.g., Tavares or 32778"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-white text-gray-900"
              />
            </div>
          </div>
          <AddressAutosuggest
            value={address}
            onChange={setAddress}
            onSelect={handleParcelSelect}
            state={searchState}
            city={searchCity}
          />
        </div>
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setSaveNowNonce((n) => n + 1);
              setTimeout(() => window.open("/agent-vault", "_blank"), 600);
            }}
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
              className={
                "flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-xs transition whitespace-nowrap " +
                (activeTab === tab.num
                  ? "bg-[#c9a227] text-white shadow-lg"
                  : tab.done
                  ? "bg-green-600/30 text-green-300 border border-green-500/40"
                  : "bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20")
              }
            >
              <span className="text-lg">{tab.done && activeTab !== tab.num ? "[v]" : tab.icon}</span>
              <span>
                {tab.num}. {tab.label}
              </span>
            </button>
          ))}
        </div>
        {activeTab === 1 && (
          <>
            <CSVImport onImport={handleCSVImport} />
            <Tab1PropertyBasics
              data={propertyData}
              setData={setPropertyData}
              onNext={() => setActiveTab(2)}
              address={address}
            />
          </>
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
            virtualTourUrl={virtualTourUrl}
            droneUrl={droneUrl}
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
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
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
