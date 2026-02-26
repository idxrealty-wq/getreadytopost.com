"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Analysis {
  overall: string;
  rewrite: string;
  categories: {
    headline: { grade: string; feedback: string };
    length: { grade: string; feedback: string };
    emotion: { grade: string; feedback: string };
    keywords: { grade: string; feedback: string };
    cta: { grade: string; feedback: string };
    professionalism: { grade: string; feedback: string };
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
          <p className="text-white text-xl">Loading results...</p>
        </div>
      </main>
    );
  }

  if (!submission || !submission.analysis) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No analysis found.</p>
        </div>
      </main>
    );
  }

  const analysis = submission.analysis;

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* STEP INDICATOR */}
        <div className="mb-12">
          <div className="flex justify-center gap-4 flex-wrap">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  currentStep === step.number
                    ? "bg-gradient-to-r from-[#c9a227] to-[#d4b03a] text-black shadow-lg scale-105"
                    : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                }`}
              >
                <span className="text-xl">{step.icon}</span>
                <span>{step.number}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: GRADES */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-white text-center mb-12">
              Your Listing Grade
            </h1>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 border-2 border-blue-500/40">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">📊</div>
                <h2 className="text-4xl font-bold text-white mb-2">Original Listing</h2>
                <p className="text-white/80">How your current listing scores</p>
              </div>

              <div className="flex justify-center mb-8">
                <div
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    backgroundColor: gradeColor(analysis.overall),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <span className="text-6xl font-bold text-white">
                    {analysis.overall}
                  </span>
                  <span className="text-white text-sm font-semibold mt-1">
                    {gradeLabel(analysis.overall)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analysis.categories).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
                  >
                    <div className="text-base text-white/70 capitalize mb-2 font-semibold">
                      {key}
                    </div>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: gradeColor(value.grade),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <span className="text-white font-bold text-lg">
                        {value.grade}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs leading-tight">
                      {value.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#c9a227] hover:bg-[#d4b03a] text-black font-bold py-4 px-8 rounded-xl text-lg transition shadow-lg"
              >
                View Rewrite →
              </button>
            </div>
          </div>
        )}
        {/* STEP 2: REWRITE */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-white text-center mb-12">
              Your Improved Listing
            </h1>

            <div className="bg-gradient-to-br from-amber-700 to-orange-900 rounded-3xl p-8 border-2 border-amber-400/40">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">✍️</div>
                <h2 className="text-4xl font-bold text-white mb-2">Professional Rewrite</h2>
                <p className="text-white/80">140–160 words, buyer-focused, MLS-ready</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap font-light">
                  {analysis.rewrite}
                </p>
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(analysis.rewrite || "")}
                className="w-full bg-white text-amber-900 font-bold py-4 px-8 rounded-xl text-lg hover:bg-gray-100 transition shadow-lg mb-8"
              >
                Copy to Clipboard
              </button>

              <div>
                <h3 className="text-xl font-bold text-white mb-6">Key Recommendations</h3>
                <div className="space-y-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-black"
                        style={{ backgroundColor: "#c9a227" }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-white/90 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#c9a227] hover:bg-[#d4b03a] text-black font-bold py-4 px-8 rounded-xl text-lg transition shadow-lg"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NEXT STEPS */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-white text-center mb-12">
              Next Steps
            </h1>

            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-8 border-2 border-green-500/40">
              <div className="text-center mb-8">
                <div className="text-7xl mb-4">🚀</div>
                <h2 className="text-4xl font-bold text-white mb-2">Ready to Launch</h2>
                <p className="text-white/80">Your listing is ready to go live</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📋</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Copy Your Rewrite</h3>
                      <p className="text-white/70 mb-4">
                        Go back to Step 2 and copy the improved listing to your clipboard.
                      </p>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm font-bold text-white/90 hover:text-white underline underline-offset-2"
                      >
                        Back to Rewrite →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🌐</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Update Your MLS</h3>
                      <p className="text-white/70">
                        Paste the new description into your MLS listing (Stellar, Zillow, Realtor.com, or your local board).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📈</div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-2">Watch Results</h3>
                      <p className="text-white/70">
                        Track showings, inquiries, and offers. Better copy = more buyer interest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <a
                  href="/rate-my-listing"
                  className="block w-full bg-white text-green-900 font-bold py-4 px-8 rounded-xl text-lg text-center hover:bg-gray-100 transition shadow-lg"
                >
                  Analyze Another Listing
                </a>
                <a
                  href="/agent-vault"
                  className="block w-full bg-white/20 border border-white/40 text-white font-bold py-4 px-8 rounded-xl text-lg text-center hover:bg-white/30 transition"
                >
                  View Agent Vault
                </a>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
