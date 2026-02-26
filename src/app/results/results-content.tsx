"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Analysis {
  overall: string;
  rewrite: string;
  rewriteWordCount?: number;
  categories: {
    headline: { grade: string; feedback: string };
    length: { grade: string; feedback: string };
    emotion: { grade: string; feedback: string };
    keywords: { grade: string; feedback: string };
    cta: { grade: string; feedback: string };
    professionalism?: { grade: string; feedback: string };
    compliance?: { grade: string; feedback: string };
  };
  recommendations: string[];
}

interface Submission {
  listingText: string;
  analysis?: Analysis;
  status: string;
}

const steps = [
  { number: 1, label: "Grades", icon: "📊" },
  { number: 2, label: "Rewrite", icon: "✍️" },
  { number: 3, label: "Next Steps", icon: "🚀" },
];

const gradeColor = (grade: string) => {
  switch (grade) {
    case "A":
      return "#27ae60";
    case "B":
      return "#f39c12";
    case "C":
      return "#e74c3c";
    case "D":
      return "#c0392b";
    case "F":
      return "#95a5a6";
    default:
      return "#7f8c8d";
  }
};

const gradeLabel = (grade: string) => {
  switch (grade) {
    case "A":
      return "Excellent";
    case "B":
      return "Good";
    case "C":
      return "Fair";
    case "D":
      return "Poor";
    case "F":
      return "Incomplete";
    default:
      return "Unknown";
  }
};

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!submissionId) return;

    const fetchSubmission = async () => {
      try {
        const docRef = doc(db, "submissions", submissionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSubmission(docSnap.data() as Submission);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  if (loading) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading your results…</p>
        </div>
      </main>
    );
  }

  if (!submissionId) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Missing submission id.</p>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Submission not found.</p>
      </main>
    );
  }

  const analysis = submission.analysis;

  if (!analysis) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <p className="text-white/80">Analysis not available yet.</p>
      </main>
    );
  }

  const overall = String(analysis.overall || "");
  const overallColor = gradeColor(overall);

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Your Listing Results
          </h1>
          <p className="text-white/80">
            Step through grades, the MLS-ready rewrite, and next steps.
          </p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm uppercase tracking-wide mb-2">
                Overall Grade
              </p>
              <div className="inline-flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: overallColor }}
                >
                  {overall || "—"}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {gradeLabel(overall)}
                  </p>
                  <p className="text-white/70 text-sm">
                    Based on 6 categories + compliance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {steps.map(s => (
                <button
                  key={s.number}
                  onClick={() => setCurrentStep(s.number)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    currentStep === s.number
                      ? "bg-white text-[#1a2b4a] border-white"
                      : "bg-transparent text-white border-white/30 hover:border-white/60"
                  }`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Grades</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(analysis.categories || {}).map(([key, val]) => {
                const grade = String((val as any)?.grade || "");
                const feedback = String((val as any)?.feedback || "");
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-[#1a2b4a] capitalize">
                        {key}
                      </p>
                      <span
                        className="px-3 py-1 rounded-full text-white text-sm font-bold"
                        style={{ backgroundColor: gradeColor(grade) }}
                      >
                        {grade || "—"}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {feedback || "No feedback provided."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-4">Rewrite</h2>

            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                borderLeft: "4px solid #3498db",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "12px",
                  color: "#7f8c8d",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Rewrite Word Count
              </p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#2c3e50" }}>
                {typeof analysis.rewriteWordCount === "number" ? analysis.rewriteWordCount : "—"} words
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {analysis.rewrite || "No rewrite returned."}
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Next Steps</h2>

            <ol className="list-decimal pl-6 space-y-3 text-gray-800">
              {(Array.isArray(analysis.recommendations) ? analysis.recommendations : []).map(
                (rec, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rec}
                  </li>
                )
              )}
            </ol>

            <div className="mt-8">
              <a
                href="/rate-my-listing"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold bg-[#1a2b4a] text-white hover:bg-[#243a63] transition"
              >
                Run another listing
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
