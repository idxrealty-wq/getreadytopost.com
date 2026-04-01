"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { getUserListings, type Listing } from "@/lib/listings";
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Report {
  id: string;
  email: string;
  listingText: string;
  status: string;
  analysis?: { overall: string; categories: any; rewrite: any; recommendations: string[] };
  createdAt: string;
  saved?: boolean;
}

interface ClosingCostEstimate {
  id: string;
  address: string;
  salePrice: number;
  results: { buyerTotal: number; buyerCashToClose: number; sellerTotal: number; sellerNetProceeds: number };
  savedAt: string;
}

interface UserSubscription {
  planId: string;
  status: "active" | "inactive" | "past_due" | "cancelled";
  vaultAccess: boolean;
  workspaceAccess: boolean;
  renewalDate?: string;
}

const gradeColor: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-blue-600",
  C: "bg-yellow-600",
  D: "bg-orange-600",
  F: "bg-red-600",
};

function formatDate(dateString: any) {
  if (!dateString || typeof dateString !== "string") return "Unknown date";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getRewriteWordCount(rewrite?: any) {
  if (!rewrite || typeof rewrite !== "string") return 0;
  return rewrite.trim().split(/\s+/).length;
}
export default function VaultPage() {
  const { user, loading: authLoading } = useUser();
  const [tab, setTab] = useState<"listings" | "reports" | "closing">("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [closingEstimates, setClosingEstimates] = useState<ClosingCostEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkVaultAccess();
      loadListings();
      loadReports();
      fetchCreditBalance();
    } else if (!authLoading && !user) {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [user, authLoading]);

  async function checkVaultAccess() {
    if (!user) {
      setCheckingAccess(false);
      return;
    }
    try {
      const res = await fetch(`/api/entitlements/check?userId=${user.uid}`);
      const data = await res.json();
      setSubscription(data.subscription || null);
    } catch (err) {
      console.error("Failed to check vault access:", err);
    } finally {
      setCheckingAccess(false);
    }
  }

  async function fetchCreditBalance() {
    if (!user) return;
    try {
      const res = await fetch("/api/credits/balance?userId=" + user.uid);
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
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  }

  async function loadClosingEstimates() {
    if (!user) return;
    try {
      const ref = collection(db, "users", user.uid, "closingCostEstimates");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ClosingCostEstimate));
      data.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
      setClosingEstimates(data);
    } catch (err) {
      console.error("Failed to load closing estimates:", err);
    }
  }

  async function handleDelete(listingId: string, address: string) {
    if (!user) return;
    if (!window.confirm('Delete "' + address + '"? This cannot be undone.')) return;
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
  if (authLoading || checkingAccess) {
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
          <h1 className="text-3xl font-bold text-white mb-4">Sign in to access your vault</h1>
          <Link href="/" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">Back to Home</Link>
        </div>
      </main>
    );
  }

  if (!subscription?.vaultAccess) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Agent Vault Requires a Membership</h1>
          <p className="text-gray-300 mb-8 text-lg">Unlock your Agent Vault with any membership plan to save listings, reports, and closing cost estimates.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-[#c9a227] mb-3">Monthly</h3>
              <p className="text-3xl font-bold text-white mb-1">$30</p>
              <p className="text-gray-400 text-sm mb-6">/month</p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6">
                <li>✓ Agent Vault Access</li>
                <li>✓ 30 Credits</li>
                <li>✓ Property Pulls @ $3</li>
              </ul>
              <a href="https://square.link/u/8XSx13eJ" className="w-full inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold transition">Get Started</a>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-[#c9a227]/50">
              <h3 className="text-2xl font-bold text-[#c9a227] mb-3">Annual</h3>
              <p className="text-3xl font-bold text-white mb-1">$899</p>
              <p className="text-gray-400 text-sm mb-6">/year</p>
              <ul className="text-gray-300 text-sm space-y-2 mb-6">
                <li>✓ Agent Vault Access</li>
                <li>✓ 450 Credits</li>
                <li>✓ Property Pulls @ $1.75</li>
              </ul>
              <a href="https://square.link/u/z7zZwqR3" className="w-full inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-3 rounded-xl font-bold transition">Get Started</a>
            </div>
          </div>
          <p className="text-gray-400 mb-6">Or upgrade your plan to unlock Vault access.</p>
          <Link href="/pricing" className="text-[#c9a227] hover:text-[#e8c547] font-semibold">View All Plans</Link>
        </div>
      </main>
    );
  }
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Agent Vault</h1>
          <p className="text-gray-300 mb-6">All your saved listings and reports</p>
          {creditBalance !== null && (
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-gray-300 text-sm mb-1">Credit Balance</p>
              <div className="flex items-center justify-between gap-4">
                <p className="text-3xl font-bold text-[#c9a227]">{creditBalance}</p>
                <Link href="/checkout" className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-4 py-2 rounded-lg font-bold text-sm transition">
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
            className={
              "px-6 py-3 font-bold transition " +
              (tab === "listings"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white")
            }
          >
            Descriptions ({listings.length})
          </button>
          <button
            onClick={() => setTab("reports")}
            className={
              "px-6 py-3 font-bold transition " +
              (tab === "reports"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white")
            }
          >
            Rate My Listing Reports ({reports.length})
          </button>
          <button
            onClick={() => {
              setTab("closing");
              loadClosingEstimates();
            }}
            className={
              "px-6 py-3 font-bold transition " +
              (tab === "closing"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white")
            }
          >
            Closing Costs ({closingEstimates.length})
          </button>
          <Link
            href="/maps/my-map"
            className="ml-auto flex items-center gap-2 text-gray-400 hover:text-[#c9a227] px-6 py-3 font-bold transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Property Map
          </Link>
        </div>

        {tab === "listings" && (
          <>
            {loading ? (
              <p className="text-gray-300">Loading listings...</p>
            ) : listings.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">No Listings Yet</h2>
                <p className="text-gray-300 mb-6">Create your first listing to get started!</p>
                <Link href="/workspace" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
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
                        src={listing.photos[0].downloadURL || listing.photos[0].url || ""}
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
                          <p className="text-white font-bold">{listing.propertyData?.beds || "-"}</p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-gray-400 text-xs">Baths</p>
                          <p className="text-white font-bold">{listing.propertyData?.baths || "-"}</p>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <p className="text-gray-400 text-xs">Sqft</p>
                          <p className="text-white font-bold text-xs">{listing.propertyData?.sqft || "-"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Link href={"/listing/" + listing.id} className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-3 py-2 rounded-lg text-sm font-bold transition text-center border border-blue-500/40">
                          View
                        </Link>
                        <Link href={"/documents/view?id=" + listing.id} className="flex-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-3 py-2 rounded-lg text-sm font-bold transition text-center border border-purple-500/40">
                          🔐 Vault
                        </Link>
                        <Link href={"/workspace?edit=" + listing.id} className="flex-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-3 py-2 rounded-lg text-sm font-bold transition text-center border border-amber-500/40">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id, listing.address || "Listing")}
                          disabled={deleting === listing.id}
                          className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-3 py-2 rounded-lg text-sm font-bold transition border border-red-500/40 disabled:opacity-50"
                        >
                          {deleting === listing.id ? "..." : "X"}
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
                <h2 className="text-2xl font-bold text-white mb-3">No Reports Yet</h2>
                <p className="text-gray-300 mb-6">Run a Rate My Listing analysis to generate your first report!</p>
                <Link href="/" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-[#c9a227]/50 transition">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-grow">
                        <h3 className="text-white font-bold text-lg mb-1">Rate My Listing Report</h3>
                        <p className="text-gray-400 text-sm">{formatDate(report.createdAt)}</p>
                      </div>
                      {report.analysis?.overall && (
                        <div className={`${gradeColor[report.analysis.overall] || "bg-gray-600"} text-white px-4 py-2 rounded-lg font-bold text-2xl`}>
                          {report.analysis.overall}
                        </div>
                      )}
                    </div>
                    {report.analysis?.categories && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {Object.entries(report.analysis.categories).map(([cat, grade]: [string, any]) => (
                          <div key={cat} className="bg-white/5 rounded-lg p-3">
                            <p className="text-gray-400 text-xs capitalize mb-1">{cat.replace(/_/g, " ")}</p>
                            <p className={`${gradeColor[grade] || "bg-gray-600"} text-white px-2 py-1 rounded font-bold text-center inline-block w-full`}>
                              {grade}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {report.analysis?.rewrite && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs mb-2">Improved Description ({getRewriteWordCount(report.analysis.rewrite)} words)</p>
                        <div className="bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto">
                          <p className="text-gray-200 text-sm">{report.analysis.rewrite}</p>
                        </div>
                      </div>
                    )}
                    {report.analysis?.recommendations && report.analysis.recommendations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs mb-2">Recommendations</p>
                        <ul className="space-y-1">
                          {report.analysis.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                            <li key={idx} className="text-gray-300 text-sm flex gap-2">
                              <span className="text-[#c9a227]">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <a href={`/results?reportId=${report.id}`} className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-bold transition text-center border border-blue-500/40">
                        Full Report
                      </a>
                      <button className="flex-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-amber-500/40">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "closing" && (
          <>
            {closingEstimates.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-3">No Closing Cost Estimates Yet</h2>
                <p className="text-gray-300 mb-6">Calculate closing costs for your transactions to save them here.</p>
                <Link href="/closing-costs" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
                  Calculate Closing Costs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {closingEstimates.map((estimate) => (
                  <div key={estimate.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-[#c9a227]/50 transition">
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-lg mb-1">{estimate.address}</h3>
                      <p className="text-gray-400 text-sm">Sale Price: ${estimate.salePrice?.toLocaleString() || "N/A"}</p>
                      <p className="text-gray-400 text-xs mt-1">{formatDate(estimate.savedAt)}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Buyer Total</p>
                        <p className="text-white font-bold">${estimate.results?.buyerTotal?.toLocaleString() || "N/A"}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Buyer Cash to Close</p>
                        <p className="text-white font-bold">${estimate.results?.buyerCashToClose?.toLocaleString() || "N/A"}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Seller Total</p>
                        <p className="text-white font-bold">${estimate.results?.sellerTotal?.toLocaleString() || "N/A"}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Seller Net Proceeds</p>
                        <p className="text-white font-bold">${estimate.results?.sellerNetProceeds?.toLocaleString() || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`/closing-costs?estimateId=${estimate.id}`} className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-4 py-2 rounded-lg text-sm font-bold transition text-center border border-blue-500/40">
                        View Details
                      </a>
                      <button className="flex-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-4 py-2 rounded-lg text-sm font-bold transition border border-amber-500/40">
                        Download PDF
                      </button>
                    </div>
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
