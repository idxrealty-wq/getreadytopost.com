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

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PAGE 1: GRADES */}
        {page === 1 && (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white text-center mb-12">
              Your Listing Analysis
            </h1>

            {/* Original Listing Grade */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Original Listing Grade
              </h2>
              <div className="flex items-center justify-center">
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: gradeColor(analysis.overall),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="text-5xl font-bold text-white">
                    {analysis.overall}
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-300 mt-6 text-lg">
                {analysis.overall === "A"
                  ? "Excellent listing"
                  : analysis.overall === "B"
                  ? "Good listing with room for improvement"
                  : analysis.overall === "C"
                  ? "Fair listing - significant improvements needed"
                  : analysis.overall === "D"
                  ? "Poor listing - major revisions recommended"
                  : "Incomplete or unusable listing"}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Category Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.categories).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold capitalize">
                        {key}
                      </span>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: gradeColor(value.grade),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="text-white font-bold text-sm">
                          {value.grade}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{value.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setPage(2)}
                className="bg-[#c9a227] hover:bg-[#d4b03a] text-black font-bold py-3 px-8 rounded-lg transition"
              >
                View Rewrite →
              </button>
            </div>
          </div>
        )}
        {/* PAGE 2: REWRITE + RECOMMENDATIONS */}
        {page === 2 && (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white text-center mb-12">
              Professional Rewrite
            </h1>

            {/* Rewrite Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                Your Improved Listing
              </h2>
              <div className="bg-white/5 rounded-lg p-6 border-l-4 border-[#c9a227]">
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                  {analysis.rewrite}
                </p>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                Key Recommendations
              </h3>
              <ol className="space-y-4">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className="flex items-center justify-center h-8 w-8 rounded-full"
                        style={{ backgroundColor: "#c9a227" }}
                      >
                        <span className="text-black font-bold text-sm">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-lg leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setPage(1)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                ← Back to Grades
              </button>
              <button
                onClick={() => setPage(3)}
                className="bg-[#c9a227] hover:bg-[#d4b03a] text-black font-bold py-3 px-8 rounded-lg transition"
              >
                Next Steps →
              </button>
            </div>
          </div>
        )}

        {/* PAGE 3: CTA / NEXT STEPS */}
        {page === 3 && (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white text-center mb-12">
              Next Steps
            </h1>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Publish?
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Copy the improved listing above and update your MLS listing.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(analysis.rewrite || "")}
                className="w-full bg-[#c9a227] hover:bg-[#d4b03a] text-black font-bold py-4 px-8 rounded-lg text-lg transition"
              >
                Copy Rewrite to Clipboard
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                Analyze Another Listing
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Run another listing through the tool to improve your next post.
              </p>
              <a
                href="/rate-my-listing"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg text-center transition"
              >
                Analyze Another Listing
              </a>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => setPage(2)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                ← Back to Rewrite
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
