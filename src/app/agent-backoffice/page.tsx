"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

interface Transaction {
  id: string;
  type: string;
  packageType: string;
  creditsAdded: number;
  revenue: number;
  source: string;
  orderId: string;
  paymentId: string;
  timestamp: string;
}

interface Listing {
  id: string;
  address: string;
  createdAt: string;
  fieldCount: number;
  aiListing: boolean;
}

interface BackofficeData {
  uid: string;
  balance: number;
  transactions: Transaction[];
  listings: Listing[];
}

export default function AgentBackofficePage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [data, setData] = useState<BackofficeData | null>(null);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchBackofficeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const fetchBackofficeData = async () => {
    try {
      setFetching(true);
      setError("");

      if (!user || !auth.currentUser) {
        setError("Please sign in");
        setFetching(false);
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/agent/backoffice", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load data");
        return;
      }

      setData(json);
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e.message || "Error loading data");
    } finally {
      setFetching(false);
    }
  };

  const fmtMoney = (n: number) => `$${Number(n || 0).toFixed(2)}`;

  const getFirstName = () => {
    const full = (profile?.fullName || "").trim();
    const first = full.split(" ")[0];
    return first || "Agent";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f] p-8 pt-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{getFirstName()}'s Back Office</h1>
          <p className="text-gray-300">Your credits, transactions, and listings at a glance.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!data && !error && (
          <button
            onClick={fetchBackofficeData}
            disabled={fetching}
            className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {fetching ? "Loading..." : "Load Data"}
          </button>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-gray-300 text-sm mb-1">Credit Balance</p>
                <p className="text-5xl font-bold text-[#c9a227]">{data.balance}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <p className="text-gray-300 text-sm mb-1">Listings (last 20)</p>
                <p className="text-5xl font-bold text-[#c9a227]">{data.listings.length}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Transactions</h2>

              {data.transactions.length === 0 ? (
                <p className="text-gray-400">No transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-white">Date & Time</th>
                        <th className="px-4 py-3 text-left font-bold text-white">Package</th>
                        <th className="px-4 py-3 text-right font-bold text-white">Credits</th>
                        <th className="px-4 py-3 text-right font-bold text-white">Revenue</th>
                        <th className="px-4 py-3 text-left font-bold text-white">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-4 py-3 text-xs">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3 capitalize text-[#c9a227] font-bold">
                            {tx.packageType || tx.type || "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">{tx.creditsAdded}</td>
                          <td className="px-4 py-3 text-right text-green-400 font-bold">
                            {fmtMoney(tx.revenue)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{tx.source || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Recent Listings</h2>

              {data.listings.length === 0 ? (
                <p className="text-gray-400">No listings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-300">
                    <thead className="bg-white/5 border-b border-white/20">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-white">Address</th>
                        <th className="px-4 py-3 text-left font-bold text-white">Date & Time</th>
                        <th className="px-4 py-3 text-right font-bold text-white">Fields</th>
                        <th className="px-4 py-3 text-left font-bold text-white">AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.listings.map((l) => (
                        <tr key={l.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-4 py-3 text-white font-medium">{l.address || "—"}</td>
                          <td className="px-4 py-3 text-xs">
                            {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">{l.fieldCount}</td>
                          <td className="px-4 py-3">{l.aiListing ? "✅" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
