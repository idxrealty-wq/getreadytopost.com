"use client";

import { useEffect, useState, useRef } from "react";

const BEFORE_TEXT = `3 bedroom 2 bath home in a great neighborhood. Updated kitchen and bathrooms. Large backyard. Close to schools and shopping. Won't last long!`;

const AFTER_TEXT = `Discover this beautifully updated 3-bed, 2-bath retreat in one of the area's most sought-after neighborhoods. The renovated kitchen features modern finishes, while the spacious backyard offers endless possibilities for entertaining. Walking distance to top-rated schools and premier shopping — this move-in-ready gem won't stay on the market long.`;

const CATEGORIES = [
  { label: "Clarity", score: 62, color: "#f59e0b" },
  { label: "Buyer Focus", score: 48, color: "#ef4444" },
  { label: "Keyword Optimization", score: 55, color: "#f59e0b" },
  { label: "Length", score: 70, color: "#22c55e" },
  { label: "Emotional Appeal", score: 40, color: "#ef4444" },
  { label: "MLS Compliance", score: 78, color: "#22c55e" },
];

const GRADE_SLOTS = ["A+", "A", "A-", "B+", "B", "C+", "C", "B-", "D", "B-"];
const FINAL_GRADE = "B-";

type Stage = "typing" | "grading" | "slot" | "rewrite" | "done";

export default function LiveListingDemo() {
  const [stage, setStage] = useState<Stage>("typing");
  const [typedText, setTypedText] = useState("");
  const [visibleBars, setVisibleBars] = useState<number[]>([]);
  const [barWidths, setBarWidths] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [slotGrade, setSlotGrade] = useState("A+");
  const [showRewrite, setShowRewrite] = useState(false);
  const [rewriteOpacity, setRewriteOpacity] = useState(0);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAll = () => {
    setStage("typing");
    setTypedText("");
    setVisibleBars([]);
    setBarWidths([0, 0, 0, 0, 0, 0]);
    setSlotGrade("A+");
    setShowRewrite(false);
    setRewriteOpacity(0);
  };

  // STAGE 1: Typewriter
  useEffect(() => {
    if (stage !== "typing") return;
    let i = 0;
    setTypedText("");
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

  // STAGE 2: Grade bars fill one by one
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

  // STAGE 3: Slot machine grade
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
  // STAGE 4: Rewrite fade in
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
        loopRef.current = setTimeout(() => resetAll(), 4000);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  return (
    <section className="bg-gray-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-sm font-semibold uppercase tracking-widest">Live Demo</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
            Watch Your Listing Get Graded in Real Time
          </h2>
          <p className="text-gray-400 mt-3 text-lg">
            This is exactly what happens when you submit your listing — no signup required to see it.
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">

          {/* BEFORE: Typewriter */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Original Listing</span>
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

          {/* Grade Bars */}
          {visibleBars.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-900 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">AI Analysis</span>
              </div>
              <div className="space-y-3">
                {CATEGORIES.map((cat, i) => (
                  visibleBars.includes(i) && (
                    <div key={cat.label} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-44 shrink-0">{cat.label}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${barWidths[i]}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right" style={{ color: cat.color }}>
                        {barWidths[i] > 0 ? `${barWidths[i]}` : ""}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Slot Machine Grade */}
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

          {/* AFTER: AI Rewrite */}
          {showRewrite && (
            <div style={{ opacity: rewriteOpacity, transition: "opacity 0.1s" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-900 text-green-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">✦ AI Rewrite</span>
              </div>
              <div className="bg-gray-800 rounded-xl p-5 border border-green-700">
                <p className="text-green-100 text-sm leading-relaxed">
                  {AFTER_TEXT}
                </p>
              </div>
              <div className="mt-6 text-center">
                <a
                  href="/rate-my-listing"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm transition-colors"
                >
                  Grade My Listing Free →
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
