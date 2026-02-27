"use client";

import { useState } from "react";
import { defaultClosingCostsState } from "@/lib/closing-costs/calc";
import type { ClosingCostsState } from "@/lib/closing-costs/types";
import Summary from "@/components/closing-costs/Summary";
import BuyerForm from "@/components/closing-costs/BuyerForm";
import SellerForm from "@/components/closing-costs/SellerForm";

export default function ClosingCostsPage() {
  const [state, setState] = useState<ClosingCostsState>(defaultClosingCostsState);
  const [currentPage, setCurrentPage] = useState<"summary" | "buyer" | "seller">("summary");

  const handleChange = (updates: Partial<ClosingCostsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const pages = ["summary", "buyer", "seller"];
  const currentIndex = pages.indexOf(currentPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-2">Closing Costs Calculator</h1>
        <p className="text-slate-300 mb-8">Orange County, Florida</p>

        {/* Stepper */}
        <div className="flex justify-between mb-8">
          {pages.map((page, idx) => (
            <div key={page} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentPage(page as any)}
                className={`w-10 h-10 rounded-full font-bold transition ${
                  currentIndex === idx
                    ? "bg-blue-600 text-white"
                    : currentIndex > idx
                    ? "bg-green-600 text-white"
                    : "bg-slate-600 text-white"
                }`}
              >
                {idx + 1}
              </button>
              <span className="ml-2 text-white capitalize">{page}</span>
              {idx < pages.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentIndex > idx ? "bg-green-600" : "bg-slate-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Pages */}
        {currentPage === "summary" && <Summary state={state} onStateChange={handleChange} />}
        {currentPage === "buyer" && <BuyerForm state={state} onStateChange={handleChange} />}
        {currentPage === "seller" && <SellerForm state={state} onStateChange={handleChange} />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentPage(pages[currentIndex - 1] as any)}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentPage(pages[currentIndex + 1] as any)}
            disabled={currentIndex === pages.length - 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
