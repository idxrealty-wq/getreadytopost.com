"use client";

import { useEffect, useState } from "react";

type BuildStage =
  | "idle"
  | "header"
  | "photo"
  | "copy"
  | "area"
  | "verification"
  | "documents"
  | "cta"
  | "done";

const REWRITTEN_COPY = `Welcome to this stunning 4-bedroom, 3-bath residence nestled in one of the area's most sought-after communities — where top-rated schools, premier dining, and everyday conveniences are minutes away. The heart of the home is a fully renovated chef's kitchen featuring gleaming granite countertops, stainless steel appliances, and an open layout designed for both cooking and conversation. Retreat to the spacious primary suite complete with a generous walk-in closet and spa-inspired bath. Outside, a fully fenced backyard oasis awaits — perfect for weekend gatherings or quiet evenings under the stars.`;

export default function LiveListingPreviewDemo() {
  const [stage, setStage] = useState<BuildStage>("idle");
  const [headerVisible, setHeaderVisible] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);
  const [areaVisible, setAreaVisible] = useState(false);
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [documentsVisible, setDocumentsVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const startDemo = () => {
    setStage("header");
    setHeaderVisible(false);
    setPhotoLoaded(false);
    setCopyVisible(false);
    setAreaVisible(false);
    setVerificationVisible(false);
    setDocumentsVisible(false);
    setCtaVisible(false);
  };

  const resetToIdle = () => {
    setStage("idle");
    setHeaderVisible(false);
    setPhotoLoaded(false);
    setCopyVisible(false);
    setAreaVisible(false);
    setVerificationVisible(false);
    setDocumentsVisible(false);
    setCtaVisible(false);
  };

  useEffect(() => {
    if (stage !== "header") return;
    const timer = setTimeout(() => {
      setHeaderVisible(true);
      setTimeout(() => setStage("photo"), 1200);
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "photo") return;
    const timer = setTimeout(() => {
      setPhotoLoaded(true);
      setTimeout(() => setStage("copy"), 1000);
    }, 600);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "copy") return;
    const timer = setTimeout(() => {
      setCopyVisible(true);
      setTimeout(() => setStage("area"), 1400);
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "area") return;
    const timer = setTimeout(() => {
      setAreaVisible(true);
      setTimeout(() => setStage("verification"), 1000);
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "verification") return;
    const timer = setTimeout(() => {
      setVerificationVisible(true);
      setTimeout(() => setStage("documents"), 1000);
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "documents") return;
    const timer = setTimeout(() => {
      setDocumentsVisible(true);
      setTimeout(() => setStage("cta"), 1000);
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "cta") return;
    const timer = setTimeout(() => {
      setCtaVisible(true);
      setStage("done");
    }, 100);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <section className="bg-slate-900 py-20 px-4 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest">
            Full Listing Package
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            From Rewrite to a Complete Listing Presentation
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            Better copy is just the start. See how GetReadyToPost builds your full listing package — automatically.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          {stage === "idle" ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-6 text-lg">
                Ready to see a complete listing package in action?
              </p>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={startDemo}
                  className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-base transition-colors"
                >
                  ▶ Watch the Demo
                </button>
                <button
                  onClick={resetToIdle}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 font-medium text-sm transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="px-6 py-4 border-b border-gray-700 flex items-center justify-between transition-all duration-700"
                style={{
                  opacity: headerVisible ? 1 : 0,
                  transform: headerVisible ? "translateY(0)" : "translateY(-10px)",
                }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Listing Package
                  </p>
                  <h3 className="text-white font-bold text-lg mt-0.5">
                    124 Maple Grove Lane — Orlando, FL
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">MLS# 2026-04471</p>
                  <p className="text-amber-400 font-bold text-lg">$489,000</p>
                </div>
              </div>

              <div className="px-6 pt-6">
                <div
                  className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800 transition-all duration-700"
                  style={{
                    opacity: photoLoaded ? 1 : 0,
                    transform: photoLoaded ? "scale(1)" : "scale(0.95)",
                    height: photoLoaded ? "220px" : "0px",
                  }}
                >
                  <div className="w-full h-full relative">
                    <img
                      src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/487d9896-37ba-4fe2-a8f8-38af6211eda5/image.png?w=1184&h=864"
                      alt="124 Maple Grove Lane — Exterior"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      📷 3 photos
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-5">
                <div
                  className="transition-all duration-700"
                  style={{
                    opacity: copyVisible ? 1 : 0,
                    transform: copyVisible ? "translateY(0)" : "translateY(15px)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-900 text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      ✦ AI-Enhanced Copy
                    </span>
                    <span className="bg-amber-900/50 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Grade: A
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {REWRITTEN_COPY}
                  </p>
                </div>
              </div>

              <div className="px-6 pt-5">
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: areaVisible ? 1 : 0,
                    transform: areaVisible ? "translateX(0)" : "translateX(-20px)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-900 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      📍 Area Information
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-gray-400 text-xs">Schools</p>
                      <p className="text-white text-sm font-semibold">A Rated</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-gray-400 text-xs">Walk Score</p>
                      <p className="text-white text-sm font-semibold">72 / 100</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-gray-400 text-xs">Dining</p>
                      <p className="text-white text-sm font-semibold">24 nearby</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <p className="text-gray-400 text-xs">Commute</p>
                      <p className="text-white text-sm font-semibold">18 min avg</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pt-5">
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: verificationVisible ? 1 : 0,
                    transform: verificationVisible ? "scale(1)" : "scale(0.9)",
                  }}
                >
                  <div className="flex items-center gap-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400 text-xl">
                      ✓
                    </div>
                    <div>
                      <p className="text-emerald-300 text-sm font-semibold">
                        Verified Listing
                      </p>
                      <p className="text-gray-400 text-xs">
                        Copy reviewed • Photos confirmed • Agent verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-5">
                <div
                  className="transition-all duration-500"
                  style={{
                    opacity: documentsVisible ? 1 : 0,
                    transform: documentsVisible ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-purple-900 text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      📄 Supporting Documents
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          Property Disclosure
                        </p>
                        <p className="text-gray-500 text-xs">PDF • Protected</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          Inspection Report
                        </p>
                        <p className="text-gray-500 text-xs">PDF • Protected</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-3">
                      <span className="text-2xl">🏡</span>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          HOA Summary
                        </p>
                        <p className="text-gray-500 text-xs">PDF • Protected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div
                  className="transition-all duration-700"
                  style={{
                    opacity: ctaVisible ? 1 : 0,
                    transform: ctaVisible ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-4 text-center">
                      This is what your listing could look like — polished, verified, and ready to share.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                          href="/rate-my-listing"
                          className="inline-block bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                        >
                          Grade My Listing Now →
                        </a>
                        <a
                          href="https://getreadytopost.com/listing/listing_1771692871525_iffpctrb3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                        >
                          See a Live Listing Preview →
                        </a>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                          onClick={startDemo}
                          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 font-medium text-sm transition-colors"
                        >
                          ↻ Replay Demo
                        </button>
                        <button
                          onClick={resetToIdle}
                          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 font-medium text-sm transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
