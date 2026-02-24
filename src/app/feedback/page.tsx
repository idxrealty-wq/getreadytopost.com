"use client";
import { useState } from "react";
export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("https://alluring-encouragement-production.up.railway.app/public/lead_v3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, message, source: "getreadytopost.com/feedback" }),
      });
      if (response.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };
  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/feedback-bg.png')" }}>
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative max-w-3xl mx-auto px-6 py-16">
        <div className="bg-black/45 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">Feedback</h1>
          <p className="text-gray-100 text-center mb-8">Tell us what you need, what's broken, or what would make this tool better.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-100 text-sm font-bold mb-2">Your Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-100 text-sm font-bold mb-2">Your Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none" />
            </div>
            <div>
              <label className="block text-gray-100 text-sm font-bold mb-2">Your Feedback *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you think..." rows={8} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none" />
            </div>
            <button type="submit" disabled={status === "loading"} className="w-full bg-[#c9a227] hover:bg-[#b8911f] text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50">
              {status === "loading" ? "Sending..." : "Send Feedback"}
            </button>
            {status === "success" && <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-center"><p className="text-green-100 font-bold">Thank you! We received your feedback.</p></div>}
            {status === "error" && <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-center"><p className="text-red-100 font-bold">Something went wrong. Please try again.</p></div>}
          </form>
        </div>
      </div>
    </main>
  );
}
