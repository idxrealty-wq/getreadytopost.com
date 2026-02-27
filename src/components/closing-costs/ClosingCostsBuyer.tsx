'use client';

import React from 'react';
import type { ClosingCostsState } from '@/lib/closing-costs/calc';
import { calculateBuyerCosts, calculateTotalBuyerCosts } from '@/lib/closing-costs/calc';

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

type Props = { state: ClosingCostsState };

export default function ClosingCostsBuyer({ state }: Props) {
  const costs = calculateBuyerCosts(state);
  const total = calculateTotalBuyerCosts(state);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-3">Buyer Closing Disclosure</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 px-2">Item</th>
              <th className="text-right py-2 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(costs).map(([label, amount]) => (
              <tr key={label} className="border-b border-gray-200">
                <td className="py-2 px-2">{label}</td>
                <td className="text-right py-2 px-2">{money(amount)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-2 px-2">Total Buyer Costs</td>
              <td className="text-right py-2 px-2">{money(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        This is an estimate. Actual costs may vary. Not a legal disclosure.
      </div>
    </div>
  );
}
