"use client";
import { useState } from "react";

const TABS = ["Dashboard", "Users", "Submissions", "Listings", "Errors", "Seed"];
const FB = "https://console.firebase.google.com/project/grtp2-5ba00/firestore/data";

function CopyID({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <span onClick={(e) => { e.stopPropagation(); copy(); }}
      className="font-mono text-xs text-gray-500 hover:text-yellow-400 cursor-pointer transition"
      title={id}>
      {copied ? "✅ copied" : id.slice(0, 10) + "..."}
    </span>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Dashboard");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Invalid password"); setLoading(false); return; }
      setData(json);
      setAuthed(true);
    } catch { setError("Connection failed"); }
    finally { setLoading(false); }
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">🔐 Admin</h1>
          <p className="text-gray-400 mb-6">GetReadyToPost Back Office</p>
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white mb-4 focus:outline-none focus:border-yellow-500"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? "Loading..." : "Enter"}
          </button>
        </div>
      </div>
    );
  }

  const { stats, users, submissions, listings } = data;
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
       <div className="flex items-center gap-3">
              <a href={FB} target="_blank" rel="noreferrer"
              className="text-xs bg-orange-500/20 border border-orange-500/40 text-orange-400 px-3 py-2 rounded-lg hover:bg-orange-500/30 transition">
              🔥 Firebase Console
            </a>
            <button onClick={() => { setAuthed(false); setPassword(""); setData(null); }}
              className="text-gray-500 hover:text-red-400 text-sm">Logout</button>
          </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: fmt(stats.totalRevenue), color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
            { label: "Total Users", value: stats.totalUsers, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
            { label: "Submissions", value: stats.totalSubmissions, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
            { label: "Listings Saved", value: stats.totalListings, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
            { label: "Credits Sold", value: stats.totalCredits, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
            { label: "New Users Today", value: stats.newUsersToday, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
            { label: "Submissions Today", value: stats.submissionsToday, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
            { label: "Listings Today", value: stats.listingsToday, color: "text-lime-400", bg: "bg-lime-500/10 border-lime-500/30" },
          ].map((s) => (
            <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
              <div className="text-gray-400 text-xs mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* REVENUE BY PACKAGE */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <h2 className="text-white font-bold mb-4">💳 Revenue by Package</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.revenueByPackage).map(([pkg, v]: any) => (
              <div key={pkg} className="bg-gray-800 rounded-xl p-3">
                <div className="text-yellow-400 font-bold capitalize">{pkg}</div>
                <div className="text-white text-lg font-bold">{fmt(v.revenue)}</div>
                <div className="text-gray-400 text-xs">{v.count} purchases · {v.credits} credits</div>
              </div>
            ))}
            {Object.keys(stats.revenueByPackage).length === 0 && (
              <p className="text-gray-500 text-sm col-span-3">No purchases yet.</p>
            )}
          </div>
        </div>

                {/* TABS */}
        <div className="flex gap-2 mb-4">
          {TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setSelectedUser(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t ? (t === "Seed" ? "bg-purple-500 text-white" : "bg-yellow-500 text-black") : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {t === "Seed" ? "🌱 Seed" : t}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === "Users" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            {selectedUser ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-lg">👤 {selectedUser.email}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <CopyID id={selectedUser.id} />
                      <a href={`${FB}/users/${selectedUser.id}`} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-xs hover:underline">🔥 Firebase</a>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-sm">✕ Back</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Credit Balance", value: selectedUser.creditBalance },
                    { label: "Total Spent", value: fmt(selectedUser.totalRevenue) },
                    { label: "Credits Bought", value: selectedUser.totalCredits },
                    { label: "Transactions", value: selectedUser.transactions.length },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                      <div className="text-gray-400 text-xs">{s.label}</div>
                      <div className="text-white font-bold text-lg">{s.value}</div>
                    </div>
                  ))}
                </div>
                <h3 className="text-gray-400 text-sm font-bold mb-3">TRANSACTIONS</h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-3 py-2 text-gray-500 text-xs">ID</th>
                      <th className="px-3 py-2 text-gray-500 text-xs">DATE & TIME</th>
                      <th className="px-3 py-2 text-gray-500 text-xs">PACKAGE</th>
                      <th className="px-3 py-2 text-gray-500 text-xs">CREDITS</th>
                      <th className="px-3 py-2 text-gray-500 text-xs">REVENUE</th>
                      <th className="px-3 py-2 text-gray-500 text-xs">SQUARE TX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b border-gray-800">
                        <td className="px-3 py-2"><CopyID id={tx.id} /></td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "—"}</td>
                        <td className="px-3 py-2 text-yellow-400 text-sm capitalize">{tx.packageType || '—'}</td>
                        <td className="px-3 py-2 text-white text-sm">{tx.creditsAdded}</td>
                        <td className="px-3 py-2 text-green-400 text-sm">{fmt(tx.revenue)}</td>
                        <td className="px-3 py-2"><CopyID id={tx.transactionId || '—'} /></td>
                      </tr>
                    ))}
                    {selectedUser.transactions.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-4 text-gray-500 text-sm text-center">No transactions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-800/50">
                    <th className="px-4 py-3 text-gray-400 text-xs">#</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">ID</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">EMAIL</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">CREDITS</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">SPENT</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">TX COUNT</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">JOINED</th>
                    <th className="px-4 py-3 text-gray-400 text-xs">LINKS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any, i: number) => (
                    <tr key={u.id} onClick={() => setSelectedUser(u)}
                      className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition">
                      <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                      <td className="px-4 py-3"><CopyID id={u.id} /></td>
                      <td className="px-4 py-3 text-white text-sm">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-yellow-400 text-sm font-bold">{u.creditBalance}</td>
                      <td className="px-4 py-3 text-green-400 text-sm font-bold">{fmt(u.totalRevenue)}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{u.transactions.length}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        <a href={`${FB}/users/${u.id}`} target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-orange-400 text-xs hover:underline">🔥</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {tab === "Submissions" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 text-gray-400 text-xs">#</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ID</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">EMAIL</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ADDRESS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">STATUS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">DATE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">LINKS</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s: any, i: number) => (
                  <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-3"><CopyID id={s.id} /></td>
                    <td className="px-4 py-3 text-white text-sm">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{s.address || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${s.status === 'completed' ? 'bg-green-500/20 text-green-400' : s.status === 'created' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {s.status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <a href={`/results/original/${s.id}`} target="_blank" rel="noreferrer"
                        className="text-blue-400 text-xs hover:underline">📄 View</a>
                      <a href={`${FB}/submissions/${s.id}`} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-xs hover:underline">🔥</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* LISTINGS TAB */}
        {tab === "Listings" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 text-gray-400 text-xs">#</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ID</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ADDRESS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">OWNER</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">TYPE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">BEDS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">BATHS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">SQFT</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">FIELDS</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">AI</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">FLOOD</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">DATE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">LINKS</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l: any, i: number) => (
                  <tr key={l.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-3"><CopyID id={l.id} /></td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{l.address || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.ownerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.propertyType || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.beds || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.baths || '—'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{l.sqft || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${l.fieldCount >= 30 ? 'text-green-400' : l.fieldCount >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {l.fieldCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{l.aiListing}</td>
                    <td className="px-4 py-3 text-blue-400 text-sm">{l.flood_zone || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <a href={`/listing/${l.id}`} target="_blank" rel="noreferrer"
                        className="text-blue-400 text-xs hover:underline">🏠 View</a>
                      <a href={`${FB}/listings/${l.id}`} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-xs hover:underline">🔥</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === "Dashboard" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">📊 Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-gray-400 text-sm font-bold mb-3">Latest Users</h3>
                {users.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="bg-gray-800 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm">{u.email || '—'}</div>
                      <a href={`${FB}/users/${u.id}`} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-xs hover:underline">🔥</a>
                    </div>
                    <div className="text-gray-500 text-xs">Balance: {u.creditBalance} · Spent: {fmt(u.totalRevenue)}</div>
                    <CopyID id={u.id} />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-bold mb-3">Latest Submissions</h3>
                {submissions.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="bg-gray-800 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm">{s.address || s.email || '—'}</div>
                      <div className="flex gap-2">
                        <a href={`/results/original/${s.id}`} target="_blank" rel="noreferrer"
                          className="text-blue-400 text-xs hover:underline">📄</a>
                        <a href={`${FB}/submissions/${s.id}`} target="_blank" rel="noreferrer"
                          className="text-orange-400 text-xs hover:underline">🔥</a>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">{s.status} · {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}</div>
                    <CopyID id={s.id} />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-bold mb-3">Latest Listings</h3>
                {listings.slice(0, 5).map((l: any) => (
                  <div key={l.id} className="bg-gray-800 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white text-sm">{l.address || '—'}</div>
                      <div className="flex gap-2">
                        <a href={`/listing/${l.id}`} target="_blank" rel="noreferrer"
                          className="text-blue-400 text-xs hover:underline">🏠</a>
                        <a href={`${FB}/listings/${l.id}`} target="_blank" rel="noreferrer"
                          className="text-orange-400 text-xs hover:underline">🔥</a>
                      </div>
                    </div>
                    <div className="text-gray-500 text-xs">{l.fieldCount} fields · {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}</div>
                    <CopyID id={l.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* SEED TAB */}
        {tab === "Seed" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">🌱 Seed Vendor Data</h2>
            <p className="text-gray-400 mb-6">Initialize categories and markets for the ad system.</p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/admin/seed-vendors", { method: "POST" });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || "Seed failed");
                  alert("✓ " + json.message);
                } catch (e) {
                  alert("✗ Seed failed: " + (e as Error).message);
                }
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-xl transition"
            >
              Run Seed
            </button>
          </div>
        )}

              {/* ERRORS TAB */}
        {tab === "Errors" && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-4 py-3 text-gray-400 text-xs">#</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ID</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">SOURCE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">SUBMISSION ID</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">ERROR</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">DATE</th>
                  <th className="px-4 py-3 text-gray-400 text-xs">LINKS</th>
                </tr>
              </thead>
              <tbody>
                {(data.errors || []).map((e: any, i: number) => (
                  <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-4 py-3"><CopyID id={e.id} /></td>
                    <td className="px-4 py-3 text-red-400 text-sm font-bold">{e.source || '—'}</td>
                    <td className="px-4 py-3"><CopyID id={e.submissionId || '—'} /></td>
                    <td className="px-4 py-3 text-yellow-300 text-xs max-w-xs truncate">{e.error || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <a href={`/results/original/${e.submissionId}`} target="_blank" rel="noreferrer"
                        className="text-blue-400 text-xs hover:underline">📄 View</a>
                      <a href={`${FB}/errors/${e.id}`} target="_blank" rel="noreferrer"
                        className="text-orange-400 text-xs hover:underline">🔥</a>
                    </td>
                  </tr>
                ))}
                {(data.errors || []).length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-green-400 text-sm">✅ No errors logged!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

