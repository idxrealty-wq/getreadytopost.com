export type ClosingCostsState = {
  role: 'buyer' | 'seller' | 'both';
  closingDate: string;
  propertyAddress: string;
  buyerName: string;
  sellerName: string;
  purchasePrice: number;
  loanAmount: number;
  downPaymentAmount: number;
  downPaymentType: 'amount' | 'percent';
  mortgageInsurance: boolean;
  mortgageInsuranceAmount: number;
  interestRate: number;
  termMonths: number;
  points: number;
  lenderOriginationFee: number;
  appraisalFee: number;
  creditReportFee: number;
  settlementFee: number;
  titleSearchFee: number;
  ownerTitleInsurance: boolean;
  commissionPercent: number;
  sellerCurrentAnnualTax: number;
  homesteadExemption: boolean;
  floodZone: 'A' | 'AE' | 'AO' | 'VE' | 'X' | 'Unknown';
  floodMortgage: boolean;
};

export type LineItem = {
  label: string;
  amount: number;
};

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

export function calculateBuyerCosts(state: ClosingCostsState): LineItem[] {
  return [
    { label: 'Appraisal', amount: state.appraisalFee },
    { label: 'Credit Report', amount: state.creditReportFee },
    { label: 'Settlement', amount: state.settlementFee },
    { label: 'Title Search', amount: state.titleSearchFee },
  ];
}

export function calculateSellerCosts(state: ClosingCostsState): LineItem[] {
  const commission = (state.purchasePrice * state.commissionPercent) / 100;
  return [
    { label: 'Commission', amount: commission },
    { label: 'Settlement', amount: state.settlementFee },
  ];
}
