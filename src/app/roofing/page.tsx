"use client";
import { useEffect, useState } from "react";

interface Comment {
  id: string;
  name: string;
  location: string;
  message: string;
  createdAt: string;
}

interface Vendor {
  id: string;
  businessName: string;
  shortDescription: string;
  logoUrl: string;
  phone: string;
  websiteUrl: string;
  ctaText: string;
  destinationUrl: string;
  city: string;
  state: string;
  areasServed: string[];
}

const REGIONS = [
  {
    state: "Florida",
    abbr: "FL",
    emoji: "🌴",
    climate: "Hurricane & Heat",
    commonMaterials: ["Metal Roofing", "Concrete Tile", "Modified Bitumen"],
    avgCost: "$8,000 – $18,000",
    lifespan: "25–50 years",
    biggestThreat: "Hurricanes, UV degradation, humidity",
    code: "Florida Building Code (FBC) — one of the strictest in the US",
    tip: "Metal roofs are the gold standard in FL — they handle wind uplift and reflect heat.",
    color: "from-blue-600 to-cyan-500",
  },
  {
    state: "California",
    abbr: "CA",
    emoji: "☀️",
    climate: "Wildfire & Drought",
    commonMaterials: ["Concrete Tile", "Cool Roof Coatings", "Class A Asphalt"],
    avgCost: "$10,000 – $25,000",
    lifespan: "20–50 years",
    biggestThreat: "Wildfires, seismic activity, coastal salt air",
    code: "Title 24 Energy Code — requires cool roof ratings in many zones",
    tip: "Class A fire-rated materials are required in most CA counties — don't cut corners.",
    color: "from-orange-500 to-yellow-400",
  },
  {
    state: "Texas",
    abbr: "TX",
    emoji: "🌪️",
    climate: "Hail & Tornado",
    commonMaterials: ["Impact-Resistant Shingles", "Metal Roofing", "TPO"],
    avgCost: "$7,000 – $16,000",
    lifespan: "20–40 years",
    biggestThreat: "Hail storms, high winds, extreme heat cycles",
    code: "Varies by county — many areas require impact-resistant ratings",
    tip: "Impact-resistant shingles (Class 4) can save 20–30% on homeowner insurance in TX.",
    color: "from-red-500 to-orange-400",
  },
  {
    state: "New York",
    abbr: "NY",
    emoji: "❄️",
    climate: "Snow & Ice",
    commonMaterials: ["Asphalt Shingles", "Slate", "EPDM Rubber"],
    avgCost: "$9,000 – $20,000",
    lifespan: "20–100 years",
    biggestThreat: "Ice dams, snow load, freeze-thaw cycles",
    code: "NYC Building Code — strict load and insulation requirements",
    tip: "Ice and water shield underlayment is non-negotiable in NY — skip it and pay later.",
    color: "from-indigo-500 to-blue-400",
  },
  {
    state: "Arizona",
    abbr: "AZ",
    emoji: "🏜️",
    climate: "Extreme Heat & Monsoon",
    commonMaterials: ["Foam Roofing", "Concrete Tile", "Cool Roof Coatings"],
    avgCost: "$6,000 – $14,000",
    lifespan: "20–50 years",
    biggestThreat: "UV degradation, monsoon rain, extreme heat (120°F+)",
    code: "Arizona Energy Code — cool roof requirements in hot climate zones",
    tip: "Spray polyurethane foam (SPF) is wildly popular in AZ — seamless, insulating, reflective.",
    color: "from-yellow-500 to-red-400",
  },
];

const ROOF_TYPES = [
  { name: "Asphalt Shingles", cost: "$5k–$12k", life: "20–30 yrs", best: "Budget-friendly, easy to repair", icon: "🏠" },
  { name: "Metal Roofing", cost: "$10k–$25k", life: "40–70 yrs", best: "Durability, wind/fire resistance", icon: "⚡" },
  { name: "Concrete Tile", cost: "$12k–$25k", life: "40–50 yrs", best: "Hot climates, curb appeal", icon: "🏛️" },
  { name: "Slate", cost: "$20k–$50k", life: "75–100 yrs", best: "Premium look, extreme longevity", icon: "💎" },
  { name: "Foam (SPF)", cost: "$6k–$14k", life: "20–50 yrs", best: "Flat roofs, desert climates", icon: "🫧" },
  { name: "EPDM Rubber", cost: "$5k–$12k", life: "20–30 yrs", best: "Flat roofs, cold climates", icon: "🔲" },
];
export default function RoofingPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeRegion, setActiveRegion] = useState(0);

  useEffect(() => {
    fetch("/api/roofing/comments").then(r => r.json()).then(d => {
      if (d.comments) setComments(d.comments);
    });
    fetch("/api/vendors?categoryId=roofing&status=active").then(r => r.json()).then(d => {
      if (d.vendors) setVendors(d.vendors);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/roofing/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSubmitSuccess(true);
      setName(""); setLocation(""); setMessage("");
      fetch("/api/roofing/comments").then(r => r.json()).then(d => {
        if (d.comments) setComments(d.comments);
      });
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const region = REGIONS[activeRegion];

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-950 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1632889369520-a5e1e4e5e9e0?w=1600')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-widest">Roofing Resource Center</span>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
            What's On Top of <span className="text-yellow-400">Your Home</span> Matters
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            From hurricane-proof metal roofs in Florida to wildfire-rated tiles in California — your roof needs depend entirely on where you live. Learn the differences, costs, and what to ask your contractor.
          </p>
          <a href="#compare" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition">
            Compare by State →
          </a>
        </div>
      </section>

      {/* ROOF TYPES */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Roof Types at a Glance</h2>
          <p className="text-gray-400 text-center mb-12">Every material has a sweet spot — climate, budget, and longevity all factor in.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROOF_TYPES.map((r, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/50 transition">
                <div className="text-4xl mb-3">{r.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{r.name}</h3>
                <div className="flex gap-4 text-xs text-gray-400 mb-3">
                  <span>💰 {r.cost}</span>
                  <span>⏳ {r.life}</span>
                </div>
                <p className="text-sm text-gray-300">Best for: <span className="text-yellow-400">{r.best}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGIONAL COMPARISON */}
      <section id="compare" className="py-20 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">State-by-State Roofing Comparison</h2>
          <p className="text-gray-400 text-center mb-10">Click a state to see what roofing looks like there.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {REGIONS.map((r, i) => (
              <button key={i} onClick={() => setActiveRegion(i)}
                className={"px-5 py-2 rounded-full font-semibold text-sm transition border " +
                  (activeRegion === i ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-800 text-gray-300 border-gray-600 hover:border-yellow-500")}>
                {r.emoji} {r.state}
              </button>
            ))}
          </div>
          <div className={`bg-gradient-to-br ${region.color} p-1 rounded-2xl`}>
            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{region.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold">{region.state} Roofing</h3>
                  <span className="text-sm text-gray-400">{region.climate}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Common Materials</p>
                  <ul className="space-y-1">
                    {region.commonMaterials.map((m, i) => (
                      <li key={i} className="text-sm text-white flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>{m}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Average Install Cost</p>
                  <p className="text-2xl font-bold text-yellow-400">{region.avgCost}</p>
                  <p className="text-xs text-gray-400 mt-1">Lifespan: {region.lifespan}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Biggest Threat</p>
                  <p className="text-sm text-red-400 font-medium">{region.biggestThreat}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Building Code</p>
                  <p className="text-sm text-white">{region.code}</p>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-xs text-yellow-400 font-bold uppercase tracking-wide mb-1">Pro Tip</p>
                <p className="text-sm text-gray-200">{region.tip}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AD SLOTS */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Featured Roofing Contractors</h2>
          <p className="text-gray-400 text-center mb-10">Verified professionals ready to help with your next roofing project.</p>
          {vendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((v) => (
                <div key={v.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/50 transition flex flex-col">
                  {v.logoUrl && <img src={v.logoUrl} alt={v.businessName} className="h-12 object-contain mb-4" />}
                  <h3 className="text-white font-bold text-lg mb-1">{v.businessName}</h3>
                  {v.shortDescription && <p className="text-gray-400 text-sm mb-3 flex-1">{v.shortDescription}</p>}
                  {v.areasServed?.length > 0 && (
                    <p className="text-xs text-gray-500 mb-3">📍 {v.areasServed.slice(0, 3).join(", ")}</p>
                  )}
                  <a href={v.destinationUrl || v.websiteUrl || `/vendors/${v.id}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition">
                    {v.ctaText || "Get a Quote"} →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-800 border border-dashed border-gray-600 rounded-2xl p-8 text-center">
                  <p className="text-3xl mb-3">🏗️</p>
                  <p className="text-white font-semibold mb-1">Advertise Here</p>
                  <p className="text-gray-400 text-sm mb-4">Reach homeowners actively researching roofing in your area.</p>
                  <a href="mailto:idxrealty@gmail.com?subject=Roofing Ad Inquiry" className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition">Get Listed →</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
	  {/* DISCUSSION */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Community Discussion</h2>
          <p className="text-gray-400 text-center mb-10">Share your roofing experience, ask questions, or compare notes with homeowners across the country.</p>

          {/* COMMENT FORM */}
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-10">
            <h3 className="text-lg font-bold mb-4">Leave a Comment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="John D." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Your Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Orlando, FL" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Your Comment</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required placeholder="Share your roofing experience, tips, or questions..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none" />
            </div>
            {submitError && <p className="text-red-400 text-sm mb-3">{submitError}</p>}
            {submitSuccess && <p className="text-green-400 text-sm mb-3">✅ Comment posted! Thanks for sharing.</p>}
            <button type="submit" disabled={submitting} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg text-sm transition disabled:opacity-50">
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* COMMENTS LIST */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-lg font-semibold text-gray-400">No comments yet</p>
                <p className="text-sm">Be the first to share your roofing experience!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{c.name}</p>
                        {c.location && <p className="text-gray-500 text-xs">📍 {c.location}</p>}
                      </div>
                    </div>
                    {c.createdAt && (
                      <p className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{c.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-yellow-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-3">Need a Roofing Contractor?</h2>
          <p className="text-black/70 mb-6">Browse verified roofing professionals in our vendor directory — rated, reviewed, and ready to help.</p>
          <a href="/vendors" className="inline-flex items-center justify-center bg-black text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-900 transition">
            Find a Roofer Near You →
          </a>
        </div>
      </section>

    </main>
  );
}