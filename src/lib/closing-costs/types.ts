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
