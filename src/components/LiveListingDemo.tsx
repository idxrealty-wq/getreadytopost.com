"use client";

import { useEffect, useState } from "react";

const BEFORE_TEXT = `Nice 4 bedroom 3 bath home in a desirable neighborhood. Updated kitchen with granite counters and stainless appliances. Master suite with walk-in closet. Large fenced backyard, great for entertaining. Two car garage. Close to shopping, dining and top rated schools. Home has been well maintained and is move in ready. Won't last at this price. Schedule your showing today!`;

const AFTER_TEXT = `Welcome to this stunning 4-bedroom, 3-bath residence nestled in one of the area's most sought-after communities — where top-rated schools, premier dining, and everyday conveniences are minutes away. The heart of the home is a fully renovated chef's kitchen featuring gleaming granite countertops, stainless steel appliances, and an open layout designed for both cooking and conversation. Retreat to the spacious primary suite complete with a generous walk-in closet and spa-inspired bath. Outside, a fully fenced backyard oasis awaits — perfect for weekend gatherings or quiet evenings under the stars. A two-car garage, meticulous maintenance history, and move-in-ready condition make this an effortless choice for discerning buyers. Opportunities like this don't stay on the market — schedule your private tour today.`;

const CATEGORIES = [
  { label: "Clarity", score: 65, color: "#f59e0b" },
  { label: "Buyer Focus", score: 48, color: "#ef4444" },
  { label: "Keyword Optimization", score: 58, color: "#f59e0b" },
  { label: "Length", score: 72, color: "#22c55e" },
  { label: "Emotional Appeal", score: 42, color: "#ef4444" },
  { label: "MLS Compliance", score: 76, color: "#22c55e" },
];

const GRADE_SLOTS = ["F", "D", "D+", "C", "C+", "B-", "C+", "B", "C", "B-"];
const FINAL_GRADE = "B-";

type Stage = "idle" | "typing" | "grading" | "slot" | "rewrite" | "done";

export default function LiveListingDemo() {
  const [stage, setStage] = useState<Stage>("idle");
  const [typedText, setTypedText] = useState("");
  const [visibleBars, setVisibleBars] = useState<number[]>([]);
  const [barWidths, setBarWidths] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [slotGrade, setSlotGrade] = useState("A+");
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteOpacity, setRewriteOpacity] = useState(0);

  const startDemo = () => {
    setStage("typing");
    setTypedText("");
    setVisibleBars([]);
    setBarWidths([0, 0, 0, 0, 0, 0]);
    setSlotGrade("A+");
    setShowRewrite(false);
    setRewriteOpacity(0);
  };

  const resetToIdle = () => {
    setStage("idle");
    setTypedText("");
    setVisibleBars([]);
    setBarWidths([0, 0, 0, 0, 0, 0]);
    setSlotGrade("A+");
    setShowRewrite(false);
    setRewriteOpacity(0);
  };

  useEffect(() => {
    if (stage !== "typing") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(BEFORE_TEXT.slice(0, i));
      if (i >= BEFORE_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setStage("grading"), 600);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "grading") return;
    let index = 0;
    const showNext = () => {
      if (index >= CATEGORIES.length) {
        setTimeout(() => setStage("slot"), 500);
        return;
      }
      const i = index;
      setVisibleBars((prev) => [...prev, i]);
      setTimeout(() => {
        setBarWidths((prev) => {
          const updated = [...prev];
          updated[i] = CATEGORIES[i].score;
          return updated;
        });
      }, 100);
      index++;
      setTimeout(showNext, 520);
    };
    showNext();
  }, [stage]);

  useEffect(() => {
    if (stage !== "slot") return;
    let count = 0;
    const total = 14;
    const interval = setInterval(() => {
      setSlotGrade(GRADE_SLOTS[count % GRADE_SLOTS.length]);
      count++;
      if (count >= total) {
        clearInterval(interval);
        setSlotGrade(FINAL_GRADE);
        setTimeout(() => setStage("rewrite"), 600);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== "rewrite") return;
    setShowRewrite(true);
    let opacity = 0;
    const interval = setInterval(() => {
      opacity += 0.05;
      setRewriteOpacity(Math.min(opacity, 1));
      if (opacity >= 1) {
        clearInterval(interval);
        setStage("done");
      }
    }, 40);
    return () => clearInterval(interval);
  }, [stage]);
  return (
    <section className="bg-gray-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">Live Demo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Watch Your Listing Get Graded in Real Time
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            See exactly how Rate My Listing analyzes your description and generates improvements.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {stage === "idle" ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-6 text-lg">
                Ready to see how your listing gets graded?
              </p>
              <button
                onClick={startDemo}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-base transition-colors"
              >
                ▶ Watch the Demo
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Original Listing
                  </span>
                </div>
                <div className="bg-gray-800 rounded-xl p-5 min-h-[80px] border border-gray-600">
                  <p className="text-gray-200 text-sm leading-relaxed font-mono">
                    {typedText}
                    {stage === "typing" && (
                      <span className="inline-block w-0.5 h-4 bg-yellow-400 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>

              {visibleBars.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-900 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      AI Analysis
                    </span>
                  </div>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat, i) =>
                      visibleBars.includes(i) && (
                        <div key={cat.label} className="flex items-center gap-3">
                          <span className="text-gray-400 text-xs w-44 shrink-0">{cat.label}</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${barWidths[i]}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <span className="text-xs font-bold w-8 text-right" style={{ color: cat.color }}>
                            {barWidths[i] > 0 ? `${barWidths[i]}` : ""}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {(stage === "slot" || stage === "rewrite" || stage === "done") && (
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gray-800 border-2 border-yellow-400 rounded-2xl px-10 py-6 text-center shadow-lg shadow-yellow-400/10">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Overall Grade</p>
                    <div
                      className="text-6xl font-black text-yellow-400 transition-all duration-75"
                      style={{ fontVariantNumeric: "tabular-nums", minWidth: "3rem", display: "inline-block" }}
                    >
                      {slotGrade}
                    </div>
                  </div>
                </div>
              )}

              {showRewrite && (
                <div style={{ opacity: rewriteOpacity, transition: "opacity 0.1s" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-green-900 text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      ✦ AI Rewrite
                    </span>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-5 border border-green-700">
                    <p className="text-green-100 text-sm leading-relaxed">{AFTER_TEXT}</p>
                  </div>
                </div>
              )}

              {stage === "done" && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="/rate-my-listing"
                    className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                  >
                    Grade My Listing Free →
                  </a>
                  <button
                    onClick={startDemo}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors"
                  >
                    ↻ Replay Demo
                  </button>
                  <button
                    onClick={resetToIdle}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 font-medium text-sm transition-colors"
                  >
                    ↩ Reset
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
