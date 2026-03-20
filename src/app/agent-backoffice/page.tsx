"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { updateUserProfile } from "@/lib/profile";
import { auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ExtendedProfile {
  fullName: string;
  company: string;
  designations: string;
  phone: string;
  website: string;
  title: string;
  officeAddress: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  headshot: string;
  logo: string;
}

const defaultProfile: ExtendedProfile = {
  fullName: "",
  company: "",
  designations: "",
  phone: "",
  website: "",
  title: "",
  officeAddress: "",
  facebook: "",
  linkedin: "",
  instagram: "",
  headshot: "",
  logo: "",
};

export default function AgentBackofficePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<ExtendedProfile>(defaultProfile);
  const [balance, setBalance] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const headshotRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            fullName: data.fullName || "",
            company: data.company || "",
            designations: data.designations || "",
            phone: data.phone || "",
            website: data.website || "",
            title: data.title || "",
            officeAddress: data.officeAddress || "",
            facebook: data.facebook || "",
            linkedin: data.linkedin || "",
            instagram: data.instagram || "",
            headshot: data.headshot || "",
            logo: data.logo || "",
          });
        }
        // Load credit balance
        const token = await user.getIdToken();
        const res = await fetch("/api/agent/backoffice", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setBalance(json.balance ?? 0);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };
    load();
  }, [user]);

  const handleUpload = async (
    file: File,
    field: "headshot" | "logo",
    setUploading: (v: boolean) => void
  ) => {
    if (!user) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/${field}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile((prev) => ({ ...prev, [field]: url }));
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { [field]: url, updatedAt: new Date().toISOString() });
    } catch (e) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...profile,
        profileComplete: !!(profile.fullName && profile.company),
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    key: keyof ExtendedProfile,
    placeholder: string,
    type = "text"
  ) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[key]}
        onChange={(e) => setProfile((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
      />
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </main>
    );
  }

  if (!user) return null;
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Agent Profile</h1>
            <p className="text-slate-300 text-sm mt-1">
              Complete your profile to unlock GRTP Verified and branded reports.
            </p>
          </div>
          {balance !== null && (
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Credits</p>
              <p className="text-2xl font-bold text-amber-400">{balance}</p>
            </div>
          )}
        </div>

        {/* Photo Upload */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Photos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Headshot */}
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Headshot</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {profile.headshot ? (
                    <img src={profile.headshot} alt="Headshot" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-xs text-center px-1">No photo</span>
                  )}
                </div>
                <div>
                  <input
                    ref={headshotRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "headshot", setUploadingHeadshot);
                    }}
                  />
                  <button
                    onClick={() => headshotRef.current?.click()}
                    disabled={uploadingHeadshot}
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 text-sm transition disabled:opacity-60"
                  >
                    {uploadingHeadshot ? "Uploading..." : "Upload Photo"}
                  </button>
                  <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 5MB</p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">Brokerage / Brand Logo</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-slate-600 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {profile.logo ? (
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-slate-500 text-xs text-center px-1">No logo</span>
                  )}
                </div>
                <div>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "logo", setUploadingLogo);
                    }}
                  />
                  <button
                    onClick={() => logoRef.current?.click()}
                    disabled={uploadingLogo}
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 text-sm transition disabled:opacity-60"
                  >
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </button>
                  <p className="text-xs text-slate-500 mt-1">PNG preferred, max 5MB</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Personal Info */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Personal Information</h2>
          {field("Full Name *", "fullName", "Jane Smith")}
          {field("Title / Role", "title", "Realtor®, Listing Specialist")}
          {field("Designations", "designations", "ABR, CRS, GRI")}
        </div>

        {/* Company Info */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Company Information</h2>
          {field("Brokerage / Company *", "company", "Keller Williams Realty")}
          {field("Office Address", "officeAddress", "123 Main St, Orlando, FL 32801")}
          {field("Website", "website", "https://youragentsite.com", "url")}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Contact Information</h2>
          {field("Phone", "phone", "(407) 555-1234", "tel")}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Email is tied to your account and cannot be changed here.</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Social Media Links</h2>
          {field("Facebook", "facebook", "https://facebook.com/yourpage", "url")}
          {field("LinkedIn", "linkedin", "https://linkedin.com/in/yourprofile", "url")}
          {field("Instagram", "instagram", "https://instagram.com/yourhandle", "url")}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-8 py-3 text-base transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span className="text-emerald-400 font-medium text-sm">✓ Profile saved successfully</span>
          )}
        </div>

        {/* Verification CTA */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
          <h3 className="text-lg font-bold text-amber-300 mb-1">Ready to get verified?</h3>
          <p className="text-slate-300 text-sm mb-4">
            Once your profile is complete, head to the verification page to apply for your GRTP Verified badge.
          </p>
          <a
            href="/verification"
            className="inline-block rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-2 text-sm transition"
          >
            Go to Verification →
          </a>
        </div>

      </div>
    </main>
  );
}
