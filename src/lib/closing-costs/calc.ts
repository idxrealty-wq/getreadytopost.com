import type { ClosingCostsState, LineItem } from "./types";

export function calculateDocStamps(purchasePrice: number) {
  return purchasePrice * 0.0035;
}

export function calculateIntangibleTax(loanAmount: number) {
  return loanAmount * 0.002;
}

export function calculateRecordingFees() {
  return 40 + (0.50 * 3);
}

export function calculatePropertyTaxProration(annualTax: number, closingDate: string) {
  if (!closingDate) return 0;
  const parts = closingDate.split('/');
  if (parts.length !== 3) return 0;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return 0;
  const date = new Date(year, month - 1, day);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyRate = annualTax / 365;
  return dailyRate * dayOfYear;
}

export function calculateBuyerCosts(purchasePrice: number, loanAmount: number): LineItem[] {
  const docStamps = calculateDocStamps(purchasePrice);
  const intangibleTax = calculateIntangibleTax(loanAmount);
  const recordingFees = calculateRecordingFees();
  return [
    { label: 'Appraisal', amount: 600 },
    { label: 'Title Search', amount: 150 },
    { label: 'Lender Title Insurance', amount: loanAmount * 0.005 },
    { label: 'Settlement Fee', amount: 500 },
    { label: 'Document Stamps', amount: docStamps },
    { label: 'Intangible Tax', amount: intangibleTax },
    { label: 'Recording Fees', amount: recordingFees },
  ];
}

export function calculateSellerCosts(purchasePrice: number, commissionPercent: number, annualTax: number, closingDate: string): LineItem[] {
  const commission = (purchasePrice * commissionPercent) / 100;
  const docStamps = calculateDocStamps(purchasePrice);
  const taxProration = calculatePropertyTaxProration(annualTax, closingDate);
  return [
    { label: 'Commission', amount: commission },
    { label: 'Document Stamps', amount: docStamps },
    { label: 'Settlement Fee', amount: 500 },
    { label: 'Property Tax Proration', amount: taxProration },
  ];
}
