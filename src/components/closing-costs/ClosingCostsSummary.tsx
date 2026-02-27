'use client';

import React from 'react';
import type { ClosingCostsState } from '@/lib/closing-costs/calc';
import {
  calculateBuyerCashToClose,
  calculateSellerNetProceeds,
  calculateTotalBuyerCosts,
  calculateTotalSellerCosts,
  calculatePropertyTaxProration,
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
  const tax = calculatePropertyTaxProration(state);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-3">Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Purchase Price</div>
          <div className="text-xl font-bold">{money(state.purchasePrice)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Loan Amount</div>
          <div className="text-xl font-bold">{money(state.loanAmount)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Down Payment</div>
          <div className="text-xl font-bold">{money(state.purchasePrice - state.loanAmount)}</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Closing Date</div>
          <div className="text-xl font-bold">{state.closingDate || 'Not set'}</div>
        </div>
      </div>

      <div className="border-t-2 border-gray-300 pt-4 mb-6">
        <h3 className="font-bold text-gray-900 mb-3">Property Tax Proration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded p-3 bg-blue-50">
            <div className="text-xs text-gray-600">Seller Portion (Jan 1 → Closing)</div>
            <div className="text-lg font-bold text-blue-900">{money(tax.sellerTaxProration)}</div>
            <div className="text-xs text-gray-500 mt-1">{tax.sellerDays} days</div>
          </div>

          <div className="border rounded p-3 bg-green-50">
            <div className="text-xs text-gray-600">Buyer Portion (After Closing → Dec 31)</div>
            <div className="text-lg font-bold text-green-900">{money(tax.buyerTaxProration)}</div>
            <div className="text-xs text-gray-500 mt-1">{tax.buyerDays} days</div>
          </div>

          <div className="border rounded p-3 bg-gray-50">
            <div className="text-xs text-gray-600">Seller Current Annual Tax</div>
            <div className="text-lg font-bold">{money(state.sellerCurrentAnnualTax)}</div>
          </div>

          <div className="border rounded p-3 bg-gray-50">
            <div className="text-xs text-gray-600">Buyer New Annual Tax (Est.)</div>
            <div className="text-lg font-bold">{money(tax.buyerNewAnnualTax)}</div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-300 pt-4">
        <h3 className="font-bold text-gray-900 mb-3">Closing Cost Totals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="border rounded p-3">
            <div className="text-xs text-gray-600">Buyer Closing Costs</div>
            <div className="text-xl font-bold">{money(buyerTotal)}</div>
          </div>

          <div className="border rounded p-3">
            <div className="text-xs text-gray-600">Seller Closing Costs</div>
            <div className="text-xl font-bold">{money(sellerTotal)}</div>
          </div>

          <div className="border rounded p-3 bg-blue-50">
            <div className="text-xs text-gray-600">Buyer Cash to Close (Est.)</div>
            <div className="text-xl font-bold text-blue-900">{money(buyerCashToClose)}</div>
            <div className="text-xs text-gray-500 mt-1">Down payment + closing costs</div>
          </div>

          <div className="border rounded p-3 bg-green-50">
            <div className="text-xs text-gray-600">Seller Net Proceeds (Est.)</div>
            <div className="text-xl font-bold text-green-900">{money(sellerNet)}</div>
            <div className="text-xs text-gray-500 mt-1">Sale price minus all costs</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Estimates only. This tool is not legal, tax, or title advice.
      </div>
    </div>
  );
}
