"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AddressAutosuggest from "@/components/AddressAutosuggest";

const gradingCategories = [
  {
    icon: "🎣",
    title: "Hook",
    description: "Does your opening line stop a buyer mid-scroll? The first sentence is everything.",
    color: "bg-blue-500/20 border-blue-400/40",
  },
  {
    icon: "🏠",
    title: "Features",
    description: "Are your key property details highlighted in a way that excites — not just informs?",
    color: "bg-green-500/20 border-green-400/40",
  },
  {
    icon: "🌅",
    title: "Lifestyle",
    description: "Does your description paint a picture of what it feels like to actually live there?",
    color: "bg-purple-500/20 border-purple-400/40",
  },
  {
    icon: "⚖️",
    title: "Compliance",
    description: "Is your language Fair Housing compliant and MLS-safe? One wrong word can cost you.",
    color: "bg-red-500/20 border-red-400/40",
  },
  {
    icon: "📖",
    title: "Flow",
    description: "Is it easy to read? Short sentences, active voice, no walls of text.",
    color: "bg-amber-500/20 border-amber-400/40",
  },
  {
    icon: "📣",
    title: "Call to Action",
    description: "Does it drive the buyer to schedule a showing — or just describe a house?",
    color: "bg-pink-500/20 border-pink-400/40",
  },
];

export default function RateMyListingPage() {
  const router = useRouter();

  const [listingDescription, setListingDescription] = useState("");
  const [email, setEmail] = useState("");

  const [stateVal, setStateVal] = useState("Florida");
  const [city, setCity] = useState("Orlando");
  const [address, setAddress] = useState("");

  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [price, setPrice] = useState("");

  const [hoa, setHoa] = useState("");
  const [hoaAmount, setHoaAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wordCount = useMemo(() => {
    return listingDescription.trim().split(/\s+/).filter(Boolean).length;
  }, [listingDescription]);

  const handleAddressSelect = (parcel: any) => {
    if (parcel?.beds) setBeds(String(parcel.beds));
    if (parcel?.baths) setBaths(String(parcel.baths));
    if (parcel?.sqft) setSqft(String(parcel.sqft));
    if (parcel?.year_built) setYearBuilt(String(parcel.year_built));
  };

  const handleSubmit = async () => {
    if (!listingDescription.trim() || !email.trim() || !address.trim()) {
      alert("Listing description, email, and address are required.");
      return;
    }

    setLoading(true);

    try {
      const createRes = await fetch("https://getreadytopost.com/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingDescription,
          email,
          address,
          city,
          state: stateVal,
          zip: "",
          beds: beds ? parseInt(beds, 10) : null,
          baths: baths ? parseFloat(baths) : null,
          sqft: sqft ? parseInt(sqft, 10) : null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : null,
          price: price ? parseInt(String(price).replace(/,/g, ""), 10) : null,
          hoa: hoa === "yes" ? "yes" : "no",
          hoaAmount: hoaAmount ? parseFloat(String(hoaAmount).replace(/,/g, "")) : null,
        }),
      });

      const createText = await createRes.text();
      let createJson: any = null;
      try {
        createJson = JSON.parse(createText);
      } catch {
        // leave null
      }

      if (!createRes.ok) {
        alert(createJson?.error || createText || "Create failed");
        return;
      }

      const submissionId = createJson?.submissionId;
      if (!submissionId) {
        alert("Create failed: missing submissionId");
        return;
      }

      const analysisRes = await fetch("https://getreadytopost.com/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      const analysisText = await analysisRes.text();
      let analysisJson: any = null;
      try {
        analysisJson = JSON.parse(analysisText);
      } catch {
        // leave null
      }

      if (!analysisRes.ok) {
        alert(analysisJson?.error || analysisText || "Analysis failed");
        return;
      }

      if (analysisJson?.ok) {
        setSubmitted(true);
        setTimeout(() => {
          router.push(`/rate-my-listing?submissionId=${submissionId}`);
        }, 800);
        return;
      }

      alert("Analysis failed: unknown response");
    } catch (e: any) {
      alert(`Error: ${e?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Complete!</h1>
          <p className="text-gray-300 mb-8">Redirecting to your report...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-20 min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png?w=1200&h=896"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a2b4a]/85" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white">
          <div className="inline-block bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            🔥 Instant Listing Analysis
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Rate My Listing</h1>
          <p className="text-gray-300 mb-4 text-lg">Grade → Rewrite → Report. All in one place.</p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Instant AI-powered analysis</p>
          </div>
        </section>

        <section className="mb-10">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/cbfSoBk7hfI?rel=0&modestbranding=1&color=white"
              title="Rate My Listing"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>

        <section className="mb-10">
          <Link
            href="/workspace"
            className="block bg-gradient-to-r from-[#c9a227]/20 to-amber-600/10 border-2 border-[#c9a227]/40 rounded-2xl p-6 hover:border-[#c9a227]/70 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔧</div>
              <div className="flex-1">
                <div className="text-[#c9a227] font-bold text-sm uppercase tracking-widest mb-1">
                  Having trouble writing it?
                </div>
                <h3 className="text-white font-bold text-xl mb-1">Try the Agent Workspace</h3>
                <p className="text-gray-300 text-sm">
                  Pull your property details, neighborhood data, features, and photos into one place.
                </p>
              </div>
              <div className="text-white/50 group-hover:text-[#c9a227] transition text-2xl">→</div>
            </div>
          </Link>
        </section>
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">How We Grade Your Listing</h2>
            <p className="text-gray-400">Your description is scored across 6 categories + compliance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gradingCategories.map((cat, i) => (
              <div key={i} className={`rounded-xl p-5 border ${cat.color} backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{cat.icon}</div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{cat.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{cat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Each category is scored 1–10. Your total score determines your grade — and what to fix.
            </p>
          </div>
        </section>

        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
          <h2 className="text-xl font-bold text-[#1a2b4a] mb-4 text-center">Paste Your Listing Below</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description *</label>
              <textarea
                value={listingDescription}
                onChange={(e) => setListingDescription(e.target.value)}
                placeholder="Paste your MLS listing description here..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900 resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Aim for 140–160 words for best results</p>
                <p
                  className={`text-sm font-bold ${
                    wordCount < 50 ? "text-red-500" : wordCount < 140 ? "text-amber-500" : "text-green-500"
                  }`}
                >
                  {wordCount} words
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
              <AddressAutosuggest value={address} onChange={setAddress} onSelect={handleAddressSelect} state={stateVal} city={city} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baths</label>
                <input type="number" value={baths} onChange={(e) => setBaths(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">List Price</label>
              <input
                type="text"
                value={price ? Number(price).toLocaleString() : ""}
                onChange={(e) => setPrice(e.target.value.replace(/,/g, ""))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HOA</label>
              <select value={hoa} onChange={(e) => setHoa(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900">
                <option value="">Do you have an HOA?</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {hoa === "yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOA Amount (Monthly)</label>
                <input
                  type="text"
                  value={hoaAmount ? Number(hoaAmount).toLocaleString() : ""}
                  onChange={(e) => setHoaAmount(e.target.value.replace(/,/g, ""))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#c9a227] focus:outline-none text-gray-900"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !listingDescription || !email || !address}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "🔥 Analyze My Listing"}
            </button>

            <p className="text-xs text-gray-500 text-center">Instant AI-powered analysis. Results in seconds.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
