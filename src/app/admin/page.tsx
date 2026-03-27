"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface DashboardStats {
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
  verifiedVendors: number;
  totalCategories: number;
  totalMarkets: number;
}

interface RecentVendor {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
}

const ADMIN_EMAIL = "idxrealty@gmail.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        setError("Unauthorized: Only " + ADMIN_EMAIL + " can access admin.");
        setLoading(false);
        return;
      }

      setUserEmail(user.email);
      setIsAuthorized(true);
      fetchDashboardData();
    });

    return () => unsubscribe();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, recentRes] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/recent-vendors"),
      ]);

      if (!statsRes.ok || !recentRes.ok) {
        setError("Failed to load dashboard data");
        return;
      }

      const statsJson = await statsRes.json();
      const recentJson = await recentRes.json();

      setStats(statsJson.stats);
      setRecentVendors(recentJson.vendors || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logout failed");
    }
  };

  const StatCard = ({
    title,
    value,
    color,
  }: {
    title: string;
    value: number;
    color: "blue" | "green" | "yellow" | "purple";
  }) => {
    const colorMap = {
      blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      green: "bg-green-500/20 text-green-400 border-green-500/50",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      purple: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    };

    return (
      <div className={`border rounded-lg p-6 ${colorMap[color]}`}>
        <p className="text-sm font-semibold opacity-75">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
    );
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          {error ? (
            <p className="text-red-400 text-sm mb-6">{error}</p>
          ) : (
            <p className="text-gray-400 text-sm mb-6">You must be logged in as an admin to access this page.</p>
          )}
          <button
            onClick={() => router.push("/")}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Vendor management and system overview</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Logged in as: <span className="text-yellow-400 font-semibold">{userEmail}</span></p>
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400">Loading dashboard...</div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Total Vendors" value={stats.totalVendors} color="blue" />
              <StatCard title="Pending" value={stats.pendingVendors} color="yellow" />
              <StatCard title="Approved" value={stats.approvedVendors} color="green" />
              <StatCard title="Verified" value={stats.verifiedVendors} color="purple" />
              <StatCard title="Categories" value={stats.totalCategories} color="blue" />
              <StatCard title="Markets" value={stats.totalMarkets} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <button
                onClick={() => router.push("/admin/vendors")}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition text-left"
              >
                <h3 className="text-white font-bold text-lg">Manage Vendors</h3>
                <p className="text-gray-400 text-sm mt-1">View, edit, and delete vendors</p>
              </button>

              <button
                onClick={() => router.push("/admin/vendors/new")}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition text-left"
              >
                <h3 className="text-white font-bold text-lg">Create Vendor</h3>
                <p className="text-gray-400 text-sm mt-1">Add a new vendor to the system</p>
              </button>

              <button
                onClick={() => router.push("/admin/categories")}
                className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition text-left"
              >
                <h3 className="text-white font-bold text-lg">Manage Categories</h3>
                <p className="text-gray-400 text-sm mt-1">Configure vendor categories</p>
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Vendors</h2>

              {recentVendors.length === 0 ? (
                <p className="text-gray-400">No vendors yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition cursor-pointer"
                      onClick={() => router.push(`/admin/vendors/${vendor.id}`)}
                    >
                      <div>
                        <p className="text-white font-semibold">{vendor.businessName}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold ${
                          vendor.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : vendor.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : vendor.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
