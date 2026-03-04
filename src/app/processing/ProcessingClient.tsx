"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProcessingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!submissionId) {
      setError("No submission ID provided");
      return;
    }

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/submissions/check-status?id=${submissionId}`);
        const data = await res.json();

        if (data.status === "completed") {
          router.push(`/results?id=${submissionId}&source=credit`);
          return;
        }

        if (data.status === "error") {
          setError(data.error || "Analysis failed");
          return;
        }

        setStatus(data.status || "pending");
      } catch (err) {
        console.error("Poll error:", err);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    pollStatus();

    return () => clearInterval(interval);
  }, [submissionId, router]);

  if (error) {
    return (
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
        <h1 className="text-3xl font-bold text-white mb-4">Processing Your Listing</h1>
        <p className="text-gray-300 text-lg">Our AI is analyzing your listing across 6 categories...</p>
        <p className="text-gray-400 text-sm mt-4">This usually takes 30-60 seconds</p>
      </div>
    </main>
  );
}
