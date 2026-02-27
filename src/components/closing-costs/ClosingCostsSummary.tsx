'use client';

import React from 'react';
import type { ClosingCostsState } from '@/lib/closing-costs/calc';
import {
  calculateBuyerCashToClose,
  calculateSellerNetProceeds,
  calculateTotalBuyerCosts,
  calculateTotalSellerCosts,
} from '@/lib/closing-costs/calc';

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

type Props = { state: ClosingCostsState };

export default function ClosingCostsSummary({ state }: Props) {
  const buyerTotal = calculateTotalBuyerCosts(state);
  const sellerTotal = calculateTotalSellerCosts(state);
  const buyerCashToClose = calculateBuyerCashToClose(state);
  const sellerNet = calculateSellerNetProceeds(state);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-3">Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Purchase Price</div>
          <div className="text-xl font-bold">{money(state.purchasePrice)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Loan Amount</div>
          <div className="text-xl font-bold">{money(state.loanAmount)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Buyer Closing Costs (Total)</div>
          <div className="text-xl font-bold">{money(buyerTotal)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Seller Closing Costs (Total)</div>
          <div className="text-xl font-bold">{money(sellerTotal)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Buyer Cash to Close (Est.)</div>
          <div className="text-xl font-bold">{money(buyerCashToClose)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Down payment + buyer costs. Does not subtract earnest money yet.
          </div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Seller Net Proceeds (Est.)</div>
          <div className="text-xl font-bold">{money(sellerNet)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Sale price minus seller costs. Does not include mortgage payoff unless entered.
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Estimates only. This tool is not legal, tax, or title advice.
      </div>
    </div>
  );
}
