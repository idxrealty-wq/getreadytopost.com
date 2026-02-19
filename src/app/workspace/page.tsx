"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import AuthModal from "@/components/AuthModal";
import Tab1 from "./tabs/tab1";
import Tab2 from "./tabs/tab2";
import Tab3 from "./tabs/tab3";
import Tab4 from "./tabs/tab4";
import Tab5Save from "./tabs/tab5";

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState({
    taxId: "",
    yearBuilt: "",
    beds: "",
    baths: "",
    sqft: "",
    price: "",
  });
  const [nearbyData, setNearbyData] = useState({});
  const [listingText, setListingText] = useState("");
  const [checklistState, setChecklistState] = useState({
    "Property condition": false,
    "Neighborhood appeal": false,
    "Market value": false,
    "Buyer psychology": false,
    "Unique features": false,
    "Call to action": false,
  });
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState({});
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 Workspace</h1>
          <p className="text-gray-400">Build, analyze, and save your listing packages</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                currentTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {tab === 1 && "📍 Address"}
              {tab === 2 && "🏠 Property"}
              {tab === 3 && "📝 Listing"}
              {tab === 4 && "📸 Photos"}
              {tab === 5 && "💾 Save"}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          {currentTab === 1 && (
            <Tab1 address={address} setAddress={setAddress} />
          )}
          {currentTab === 2 && (
            <Tab2 propertyData={propertyData} setPropertyData={setPropertyData} nearbyData={nearbyData} setNearbyData={setNearbyData} />
          )}
          {currentTab === 3 && (
            <Tab3 address={address} propertyData={propertyData} nearbyData={nearbyData} listingText={listingText} setListingText={setListingText} checklistState={checklistState} setChecklistState={setChecklistState} notes={notes} setNotes={setNotes} />
          )}
          {currentTab === 4 && (
            <Tab4 photos={photos} setPhotos={setPhotos} existingPhotos={existingPhotos} />
          )}
          {currentTab === 5 && (
            <Tab5Save address={address} propertyData={propertyData} nearby={nearbyData} listing={listingText} checklistState={checklistState} notes={notes} saved={saved} setSaved={setSaved} user={user} editId={editId} photos={photos} existingPhotos={existingPhotos} onSave={() => setShowAuthModal(true)} />
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={(user) => setUser(user)} />
    </div>
  );
}
