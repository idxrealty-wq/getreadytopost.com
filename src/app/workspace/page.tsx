"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import AuthModal from "@/components/AuthModal";
import Tab1 from "./tabs/tab1";
import Tab2 from "./tabs/tab2";
import Tab3 from "./tabs/tab3";
import Tab4Checklist from "./tabs/tab4";
import Tab5 from "./tabs/tab5";

function WorkspaceContent() {
  const [currentTab, setCurrentTab] = useState(1);
  const [propertyData, setPropertyData] = useState<any>({});
  const [nearbyData, setNearbyData] = useState<any>({});
  const [listingText, setListingText] = useState("");
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Record<string, any[]>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setUser(user);
          setShowAuthModal(false);
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Agent Workspace</h1>
          <p className="text-gray-300">Build, refine, and save your property listings</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
          <div className="flex border-b border-white/20">
            {[1, 2, 3, 4, 5].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`flex-1 px-6 py-4 font-bold transition ${
                  currentTab === tab
                    ? "bg-[#c9a227] text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                {tab === 1 && "Property Basics"}
                {tab === 2 && "Neighborhood"}
                {tab === 3 && "AI Listing"}
                {tab === 4 && "Documents"}
                {tab === 5 && "Save to Vault"}
              </button>
            ))}
          </div>
          <div className="p-8">
            {currentTab === 1 && (
              <Tab1
                propertyData={propertyData}
                setPropertyData={setPropertyData}
                onNext={() => setCurrentTab(2)}
              />
            )}
            {currentTab === 2 && (
              <Tab2
                nearbyData={nearbyData}
                setNearbyData={setNearbyData}
                onNext={() => setCurrentTab(3)}
              />
            )}
            {currentTab === 3 && (
              <Tab3
                propertyData={propertyData}
                listingText={listingText}
                setListingText={setListingText}
                onNext={() => setCurrentTab(4)}
              />
            )}
            {currentTab === 4 && (
              <Tab4Checklist
                checklistState={checklistState}
                setChecklistState={setChecklistState}
                notes={notes}
                setNotes={setNotes}
                photos={photos}
                setPhotos={setPhotos}
                existingPhotos={[]}
                onNext={() => setCurrentTab(5)}
              />
            )}
            {currentTab === 5 && (
              <Tab5
                propertyData={propertyData}
                nearbyData={nearbyData}
                listingText={listingText}
                checklistState={checklistState}
                notes={notes}
                photos={photos}
                user={user}
                onSave={() => setShowAuthModal(true)}
              />
            )}
          </div>
        </div>
      </div>
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
