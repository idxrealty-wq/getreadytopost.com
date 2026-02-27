'use client';

import React, { useState } from 'react';
import { defaultClosingCostsState, type ClosingCostsState } from '@/lib/closing-costs/calc';
import ClosingCostsInputs from '@/components/closing-costs/ClosingCostsInputs';
import ClosingCostsSummary from '@/components/closing-costs/ClosingCostsSummary';
import ClosingCostsBuyer from '@/components/closing-costs/ClosingCostsBuyer';
import ClosingCostsSeller from '@/components/closing-costs/ClosingCostsSeller';

export default function ClosingCostsPage() {
  const [state, setState] = useState<ClosingCostsState>(defaultClosingCostsState);
  const [currentPage, setCurrentPage] = useState<'summary' | 'buyer' | 'seller'>('summary');

  const handleChange = (updates: Partial<ClosingCostsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Closing Cost Calculator</h1>
        <p className="text-gray-600 mb-6">Orange County, Florida — 2026</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Sidebar */}
          <div className="lg:col-span-1">
            <ClosingCostsInputs state={state} onChange={handleChange} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Tabs */}
            <div className="flex gap-2 border-b border-gray-300">
              <button
                onClick={() => setCurrentPage('summary')}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  currentPage === 'summary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setCurrentPage('buyer')}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  currentPage === 'buyer'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => setCurrentPage('seller')}
                className={`px-4 py-2 font-semibold border-b-2 transition ${
                  currentPage === 'seller'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Seller
              </button>
            </div>

            {/* Page Content */}
            {currentPage === 'summary' && <ClosingCostsSummary state={state} />}
            {currentPage === 'buyer' && <ClosingCostsBuyer state={state} />}
            {currentPage === 'seller' && <ClosingCostsSeller state={state} />}

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center">
              <p>This calculator is for educational purposes only.</p>
              <p>Not a legal, tax, or title disclosure. Consult professionals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

