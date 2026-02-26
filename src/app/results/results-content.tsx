"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Analysis {
  overall: string;
  rewrite: string;
  rewriteWordCount?: number;
  rewriteGrade?: string;
  categories: any;
  rewriteCategories?: any;
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
    case "A": return "#27ae60";
    case "B": return "#f39c12";
    case "C": return "#e74c3c";
    case "D": return "#c0392b";
    case "F": return "#95a5a6";
    default: return "#7f8c8d";
  }
};

const gradeLabel = (grade: string) => {
  switch (grade) {
    case "A": return "Excellent";
    case "B": return "Good";
    case "C": return "Fair";
    case "D": return "Poor";
    case "F": return "Incomplete";
    default: return "Unknown";
  }
};

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [reanalyzing, setReanalyzing] = useState(false);

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

  const handleReanalyze = async () => {
    if (!submissionId) return;
    setReanalyzing(true);
    try {
      await fetch("/api/submissions/run-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      // Refetch submission
      const docRef = doc(db, "submissions", submissionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSubmission(docSnap.data() as Submission);
      }
    } catch (e) {
      console.error("Reanalyze error:", e);
    } finally {
      setReanalyzing(false);
    }
  };

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
  const rewriteGrade = String(analysis.rewriteGrade || "B");
  const rewriteGradeColor = gradeColor(rewriteGrade);

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Your Listing Results</h1>
          <p className="text-white/80">Step through grades, the MLS-ready rewrite, and next steps.</p>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-6 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm uppercase tracking-wide mb-2">Overall Grade</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl"
                  style={{ backgroundColor: overallColor }}
                >
                  {overall}
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">{gradeLabel(overall)}</p>
                  <p className="text-white/70 text-sm">Based on 6 categories + compliance</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {steps.map((step) => (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    currentStep === step.number
                      ? "bg-white text-[#1a2b4a]"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {step.icon} {step.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Original Listing Grades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analysis.categories || {}).map(([key, cat]: [string, any]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#1a2b4a] capitalize">{key}</h3>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: gradeColor(cat.grade) }}
                    >
                      {cat.grade}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{cat.feedback || "No feedback provided."}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-8 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a2b4a]">MLS-Ready Rewrite</h2>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-600 text-xs uppercase tracking-wide">Rewrite Word Count</p>
                  <p className="text-2xl font-bold text-[#1a2b4a]">{analysis.rewriteWordCount || 0} words</p>
                </div>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl transform -rotate-12"
                  style={{ backgroundColor: rewriteGradeColor }}
                >
                  {rewriteGrade}
                </div>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                  title="Re-run analysis"
                >
                  {reanalyzing ? "⟳ Analyzing..." : "⟳ Refresh"}
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{analysis.rewrite}</p>
            </div>
            {analysis.rewriteCategories && Object.keys(analysis.rewriteCategories).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#1a2b4a] mb-4">Rewrite Grades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.rewriteCategories).map(([key, cat]: [string, any]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#1a2b4a] capitalize">{key}</h4>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: gradeColor(cat.grade) }}
                        >
                          {cat.grade}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{cat.feedback || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1a2b4a] mb-6">Next Steps</h2>
            <ol className="space-y-4">
              {(analysis.recommendations || []).map((rec: string, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#c9a227] text-white flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-gray-800 pt-1">{rec}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
