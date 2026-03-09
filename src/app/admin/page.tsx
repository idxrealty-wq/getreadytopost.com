"use client";
import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Invalid password");
        setLoading(false);
        return;
      }
      setListings(data.listings);
      setTotal(data.total);
      setAuthed(true);
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-2">🔐 Admin</h1>
          <p className="text-gray-400 mb-6">GetReadyToPost Back Office</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white mb-4 focus:outline-none focus:border-yellow-500"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🏢 Back Office</h1>
            <p className="text-gray-400 mt-1">GetReadyToPost Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-4 py-2">
              <span className="text-yellow-400 font-bold text-lg">{total}</span>
              <span className="text-gray-400 text-sm ml-2">Total Listings</span>
            </div>
            <button onClick={() => { setAuthed(false); setPassword(""); }} className="text-gray-500 hover:text-red-400 text-sm">Logout</button>
          </div>
        </div>

        {selected && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">📋 {selected.address}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm">✕ Close</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">{k}</div>
                  <div className="text-white text-sm font-mono truncate">{String(v || '—')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">#</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">ADDRESS</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">OWNER</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">TYPE</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">FIELDS</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">AI</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">FLOOD</th>
                <th className="px-4 py-3 text-gray-400 text-xs font-bold">DATE</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => setSelected(l)}
                  className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-white text-sm font-medium">{l.address || '—'}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{l.ownerName || '—'}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{l.propertyType || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${l.fieldCount >= 30 ? 'text-green-400' : l.fieldCount >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {l.fieldCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{l.aiListing}</td>
                  <td className="px-4 py-3 text-sm text-blue-400">{l.flood_zone || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
