// src/app/maps/my-map/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { fetchAgentListings } from "@/lib/maps/fetchAgentListings";
import { PropertyPin } from "@/lib/maps/mapTypes";
import AgentMapShell from "@/components/maps/AgentMapShell";
import { AgentMapProfile } from "@/lib/maps/mapTypes";
import Link from "next/link";

export default function MyMapPage() {
  const { user, profile, loading } = useUser();
  const [mapProfile, setMapProfile] = useState<AgentMapProfile | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setFetching(true);
      setError("");

      try {
        const pins: PropertyPin[] = await fetchAgentListings(user.uid);

        const agentProfile: AgentMapProfile = {
          agentId: user.uid,
          agentName: profile?.fullName || user.displayName || "Agent",
          agentEmail: profile?.email || user.email || "",
          agentPhone: "",
          agentPhotoUrl: user.photoURL || "",
          brokerageName: profile?.company || "",
          licenseNumber: profile?.designations || "",
          serviceArea: "",
          properties: pins,
        };

        setMapProfile(agentProfile);
      } catch (err) {
        console.error("MyMapPage load error:", err);
        setError("Could not load your listings. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [user, profile]);

  // Not signed in
  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-[#0a2342] mb-3">
            Sign In to View Your Map
          </h1>
          <p className="text-gray-600 mb-6">
            Your property map is tied to your account. Sign in to see your
            listings plotted on the map.
          </p>
          <Link
            href="/signin"
            className="bg-[#c8a84b] hover:bg-[#b8973a] text-[#0a2342] font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Loading auth or fetching listings
  if (loading || fetching) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0a2342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your property map...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-[#0a2342] mb-3">
            Could Not Load Listings
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0a2342] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#0d2d52] transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // No listings yet
  if (mapProfile && mapProfile.properties.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📍</div>
          <h1 className="text-2xl font-bold text-[#0a2342] mb-3">
            No Listings on Your Map Yet
          </h1>
          <p className="text-gray-600 mb-6">
            Add listings to your Vault and they will appear as pins on your
            property map automatically.
          </p>
          <Link
            href="/agent-vault"
            className="bg-[#c8a84b] hover:bg-[#b8973a] text-[#0a2342] font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Go to Agent Vault
          </Link>
        </div>
      </main>
    );
  }

  // Map ready
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {mapProfile && (
        <>
          {/* Share bar */}
          <div className="bg-[#f0f4f8] border-b border-gray-200 px-6 py-2 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">
              Your shareable map URL:
              <span className="font-mono text-[#0a2342] ml-2">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/maps/my-map`
                  : "/maps/my-map"}
              </span>
            </p>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/maps/my-map`
                  );
                }
              }}
              className="text-xs font-semibold text-[#c8a84b] hover:text-[#b8973a] transition-colors"
            >
              Copy Link
            </button>
          </div>
          <AgentMapShell profile={mapProfile} />
        </>
      )}
    </main>
  );
}
