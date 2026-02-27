import type { ClosingCostsState, LineItem } from "./types";

export const defaultClosingCostsState: ClosingCostsState = {
  role: 'both',
  closingDate: '',
  propertyAddress: '',
  buyerName: '',
  sellerName: '',
  purchasePrice: 450000,
  loanAmount: 360000,
  downPaymentAmount: 90000,
  downPaymentType: 'amount',
  mortgageInsurance: false,
  mortgageInsuranceAmount: 0,
  interestRate: 6.5,
  termMonths: 360,
  points: 0,
  lenderOriginationFee: 0,
  appraisalFee: 600,
  creditReportFee: 50,
  settlementFee: 500,
  titleSearchFee: 150,
  ownerTitleInsurance: true,
  commissionPercent: 5.5,
  sellerCurrentAnnualTax: 1800,
  homesteadExemption: true,
  floodZone: 'X',
  floodMortgage: false,
};

export function calculateDownPayment(state: ClosingCostsState) {
  const price = state.purchasePrice || 0;
  let downAmt = state.downPaymentAmount || 0;
  if (state.downPaymentType === 'percent') {
    downAmt = (price * downAmt) / 100;
  }
  const loan = price - downAmt;
  const ltv = loan / price;
  return { downPaymentAmount: downAmt, loanAmount: loan, ltv };
}

export function calculateTitleInsurance(loanAmount: number, purchasePrice: number, ownerPolicy: boolean) {
  const lenderRate = 0.005;
  const ownerRate = 0.006;
  const lenderInsurance = loanAmount * lenderRate;
  const ownerInsurance = ownerPolicy ? purchasePrice * ownerRate : 0;
  return { lenderInsurance, ownerInsurance, total: lenderInsurance + ownerInsurance };
}

export function calculateDocStamps(purchasePrice: number) {
  const rate = 0.0035;
  return purchasePrice * rate;
}

export function calculateIntangibleTax(loanAmount: number) {
  const rate = 0.002;
  return loanAmount * rate;
}

export function calculatePropertyTaxProration(annualTax: number, closingDate: string) {
  if (!closingDate) return 0;
  const date = new Date(closingDate);
  const daysInYear = 365;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyRate = annualTax / daysInYear;
  return dailyRate * dayOfYear;
}

export function calculateBuyerCosts(state: ClosingCostsState): LineItem[] {
  const dp = calculateDownPayment(state);
  const titleIns = calculateTitleInsurance(dp.loanAmount, state.purchasePrice, state.ownerTitleInsurance);
  const docStamps = calculateDocStamps(state.purchasePrice);
  const intangibleTax = calculateIntangibleTax(dp.loanAmount);

  return [
    { label: 'Loan Origination Fee', amount: state.lenderOriginationFee },
    { label: 'Appraisal Fee', amount: state.appraisalFee },
    { label: 'Credit Report', amount: state.creditReportFee },
    { label: 'Title Search', amount: state.titleSearchFee },
    { label: 'Lender Title Insurance', amount: titleIns.lenderInsurance },
    { label: 'Owner Title Insurance', amount: titleIns.ownerInsurance },
    { label: 'Settlement/Closing Fee', amount: state.settlementFee },
    { label: 'Document Stamps (Deed)', amount: docStamps },
    { label: 'Intangible Tax', amount: intangibleTax },
    { label: 'Mortgage Insurance (UFMIP)', amount: state.mortgageInsuranceAmount },
  ];
}

export function calculateSellerCosts(state: ClosingCostsState): LineItem[] {
  const commission = (state.purchasePrice * state.commissionPercent) / 100;
  const docStamps = calculateDocStamps(state.purchasePrice);
  const taxProration = calculatePropertyTaxProration(state.sellerCurrentAnnualTax, state.closingDate);

  return [
    { label: 'Real Estate Commission', amount: commission },
    { label: 'Document Stamps (Deed)', amount: docStamps },
    { label: 'Settlement/Closing Fee', amount: state.settlementFee },
    { label: 'Property Tax Proration', amount: taxProration },
  ];
}
