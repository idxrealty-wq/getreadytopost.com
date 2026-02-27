'use client';

import React from 'react';
import type { ClosingCostsState, LineItem } from '@/lib/closing-costs/calc';
import { calculateBuyerCosts, calculateTotalBuyerCosts, calculatePropertyTaxProration } from '@/lib/closing-costs/calc';

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

type Props = { state: ClosingCostsState };

function LineLabel({ item }: { item: LineItem }) {
  return (
    <div className="flex items-start gap-2">
      <span className="inline-flex items-center justify-center text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 min-w-[52px]">
        TRID {item.tridLine}
      </span>
      <div className="leading-tight">
        <div className="font-medium text-gray-900">{item.label}</div>
        <div className="text-xs text-gray-500">{item.description}</div>
      </div>
    </div>
  );
}

export default function ClosingCostsBuyer({ state }: Props) {
  const items = calculateBuyerCosts(state);
  const total = calculateTotalBuyerCosts(state);
  const tax = calculatePropertyTaxProration(state);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-1">Buyer Closing Disclosure (Estimate)</h2>
      <div className="text-xs text-gray-500 mb-4">
        TRID line numbers are shown for reference. This is not an official Closing Disclosure.
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Buyer New Annual Tax (Est.)</div>
          <div className="text-lg font-bold">{money(tax.buyerNewAnnualTax)}</div>
          <div className="text-xs text-gray-500">Based on purchase price and selected exemptions.</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Buyer Tax Proration (Est.)</div>
          <div className="text-lg font-bold">{money(tax.buyerTaxProration)}</div>
          <div className="text-xs text-gray-500">Day after closing → Dec 31.</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-600">Seller Tax Proration (FYI)</div>
          <div className="text-lg font-bold">{money(tax.sellerTaxProration)}</div>
          <div className="text-xs text-gray-500">Jan 1 → closing day.</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-2">Item</th>
              <th className="text-right py-2 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.tridLine}-${item.label}`} className="border-b border-gray-200 align-top">
                <td className="py-3 px-2">
                  <LineLabel item={item} />
                </td>
                <td className="text-right py-3 px-2 whitespace-nowrap">{money(item.amount)}</td>
              </tr>
            ))}

            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-3 px-2">Total Buyer Costs</td>
              <td className="text-right py-3 px-2 whitespace-nowrap">{money(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        Estimate only. Not legal, tax, or title advice.
      </div>
    </div>
  );
}
