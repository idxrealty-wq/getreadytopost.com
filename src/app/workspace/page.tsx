"use client";

import { useState, Suspense } from "react";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { createUserProfile, getUserProfile } from "@/lib/profile";
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
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleGoogleSignIn = async () => {
    console.log("[Workspace] handleGoogleSignIn START");
    setAuthLoading(true);
    setAuthError("");
    try {
      const result = await signInWithGoogle();
      console.log("[Workspace] Google sign-in successful", { userId: result.user?.uid });
      if (result.user) {
        const existingProfile = await getUserProfile(result.user.uid);
        if (!existingProfile) {
          await createUserProfile(
            result.user.uid,
            result.user.email || "",
            result.user.displayName || "",
            "",
            ""
          );
        }
        setShowAuthModal(false);
      }
    } catch (err: any) {
      console.error("[Workspace] Google sign-in failed", err);
      setAuthError(err.message || "Failed to sign in with Google");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    console.log("[Workspace] handleEmailSignIn - redirecting to auth modal");
    setShowAuthModal(false);
    // TODO: Open email sign-in form
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 pointer-events-auto">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full pointer-events-auto">
            <h2 className="text-2xl font-bold mb-4">Sign In to Save Your Work</h2>
            <p className="text-gray-600 mb-6">Create a free account or sign in to save your listings, documents, and progress.</p>
            {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 pointer-events-auto"
              >
                {authLoading ? "Signing in..." : "✓ Sign In with Google (LIVE)"}
              </button>
              <button
                onClick={handleEmailSignIn}
                disabled={authLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 pointer-events-auto"
              >
                Sign In with Email
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800 font-bold pointer-events-auto"
            >
              Continue Without Saving
            </button>
          </div>
        </div>
      )}

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
              <Tab1 propertyData={propertyData} setPropertyData={setPropertyData} onNext={() => setCurrentTab(2)} />
            )}
            {currentTab === 2 && (
              <Tab2 nearbyData={nearbyData} setNearbyData={setNearbyData} onNext={() => setCurrentTab(3)} />
            )}
            {currentTab === 3 && (
              <Tab3 propertyData={propertyData} listingText={listingText} setListingText={setListingText} onNext={() => setCurrentTab(4)} />
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
                listingId="temp-listing-id"
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
