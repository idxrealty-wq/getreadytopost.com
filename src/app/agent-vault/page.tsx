"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { getUserListings, type Listing } from "@/lib/listings";
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Report {
  id: string;
  email: string;
  listingText: string;
  status: string;
  analysis?: {
    overall: string;
    categories: Record<string, { grade: string; feedback: string }>;
    rewrite: string;
    recommendations: string[];
  };
  createdAt: string;
  saved?: boolean;
}

const gradeColor: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-blue-600",
  C: "bg-yellow-600",
  D: "bg-orange-600",
  F: "bg-red-600",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRewriteWordCount(rewrite?: string) {
  if (!rewrite) return 0;
  return rewrite.trim().split(/\s+/).length;
}

export default function VaultPage() {
  const { user, loading: authLoading } = useUser();
  const [tab, setTab] = useState<"listings" | "reports">("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadListings();
      loadReports();
      fetchCreditBalance();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  async function fetchCreditBalance() {
    if (!user) return;
    try {
      const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const data = await res.json();
      setCreditBalance(data.balance || 0);
    } catch (err) {
      console.error("Failed to fetch credit balance:", err);
    }
  }

  async function loadListings() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await getUserListings(user.uid);
      setListings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    if (!user) return;
    try {
      const reportsRef = collection(db, "submissions");
      const q = query(reportsRef, where("email", "==", user.email));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Report)
      );
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  }

  async function handleDelete(listingId: string, address: string) {
    if (!user) return;
    if (!window.confirm(`Delete "${address}"? This cannot be undone.`)) return;

    setDeleting(listingId);
    try {
      const listingRef = doc(db, "listings", listingId);
      await deleteDoc(listingRef);
      setListings(listings.filter((l) => l.id !== listingId));
    } catch (err) {
      setError("Failed to delete listing");
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  if (authLoading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Sign in to access your vault
          </h1>
          <Link
            href="/"
            className="text-[#c9a227] hover:text-[#e8c547] font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🗄️ Agent Vault
          </h1>
          <p className="text-gray-300 mb-6">All your saved listings and reports</p>

          {creditBalance !== null && (
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm mb-1">Credit Balance</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-3xl font-bold text-[#c9a227]">
                  {creditBalance}
                </p>
                <Link
                  href="/checkout"
                  className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-4 py-2 rounded-lg font-bold text-sm transition"
                >
                  Buy More
                </Link>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-400/50 rounded-xl p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-8 border-b border-white/20">
          <button
            onClick={() => setTab("listings")}
            className={`px-6 py-3 font-bold transition ${
              tab === "listings"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Descriptions ({listings.length})
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`px-6 py-3 font-bold transition ${
              tab === "reports"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Rate My Listing Reports ({reports.length})
          </button>
        </div>

        {tab === "listings" && (
          <>
            {loading ? (
              <p className="text-gray-300">Loading listings...</p>
            ) : listings.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  No Listings Yet
                </h2>
                <p className="text-gray-300 mb-6">
                  Create your first listing to get started!
                </p>
                <Link
                  href="/workspace"
                  className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
                >
                  Create Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-[#c9a227]/50 transition flex flex-col"
                  >
                    {listing.photos && listing.photos.length > 0 && (
                      <img
                        src={
                          listing.photos[0].downloadURL ||
                          listing.photos[0].url ||
                          ""
                        }
                        alt={listing.address}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                        {listing.address || "Untitled"}
                      </h3>
                      <p className="text-gray-400 text-xs mb-3">
                        Tax ID: {listing.propertyData?.taxId || "N/A"}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-gray-400 text-xs">Beds</p>
                          <p className="text-white font-bold">
                            {listing.propertyData?.beds || "—"}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-gray-400 text-xs">Baths</p>
                          <p className="text-white font-bold">
                            {listing.propertyData?.baths || "—"}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-gray-400 text-xs">Sqft</p>
                          <p className="text-white font-bold text-xs">
                            {listing.propertyData?.sqft || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <Link
                          href={`/listing/${listing.id}`}
                          className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-3 py-2 rounded-lg text-sm font-bold transition text-center border border-blue-500/40"
                        >
                          View
                        </Link>
                        <Link
                          href={`/workspace?edit=${listing.id}`}
                          className="flex-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-3 py-2 rounded-lg text-sm font-bold transition text-center border border-amber-500/40"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(listing.id, listing.address || "Listing")
                          }
                          disabled={deleting === listing.id}
                          className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-3 py-2 rounded-lg text-sm font-bold transition border border-red-500/40 disabled:opacity-50"
                        >
                          {deleting === listing.id ? "..." : "✕"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {tab === "reports" && (
          <>
            {reports.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  No Reports Yet
                </h2>
                <p className="text-gray-300 mb-6">
                  Get your listing graded and save the report to your vault!
                </p>
                <Link
                  href="/rate-my-listing"
                  className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition"
                >
                  Rate My Listing
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {report.analysis && (
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white flex-shrink-0 ${
                              gradeColor[report.analysis.overall] || "bg-gray-500"
                            }`}
                          >
                            {report.analysis.overall}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold mb-1">
                            Submitted {formatDate(report.createdAt)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Rewrite: {getRewriteWordCount(report.analysis?.rewrite)} words
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/results?id=${report.id}`}
                        className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-5 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap flex-shrink-0"
                      >
                        View Report
                      </Link>
                    </div>

                    {report.analysis && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {Object.entries(report.analysis.categories).map(
                          ([key, val]) => (
                            <span
                              key={key}
                              className={`text-xs font-bold px-2 py-1 rounded-full text-white ${
                                gradeColor[val.grade] || "bg-gray-500"
                              }`}
                            >
                              {key}: {val.grade}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
