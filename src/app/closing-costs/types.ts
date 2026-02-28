export interface ClosingCostInputs {
  // Property
  salePrice: number;
  address: string;
  county: string;
  closingDate: string;

  // Loan
  isFinanced: boolean;
  loanAmount: number;
  interestRate: number;
  loanType: 'Conventional' | 'FHA' | 'VA' | 'USDA' | 'Cash';

  // Title & Insurance
  titleInsuranceProvider: 'Buyer' | 'Seller';
  ownersTitleInsurance: boolean;
  lendersTitleInsurance: boolean;
  surveyRequired: boolean;
  surveyAmount: number;

  // Property Tax
  annualPropertyTax: number;
  homesteadExemption: boolean;
  taxesPaidThrough: string;

  // HOA
  hasHOA: boolean;
  hoaMonthly: number;
  hoaEstoppelFee: number;

  // Insurance
  homeownersInsuranceAnnual: number;
  floodInsuranceAnnual: number;

  // Commission
  listingAgentCommission: number;
  buyerAgentCommission: number;

  // Seller specific
  existingMortgagePayoff: number;
  sellerConcessions: number;

  // Buyer specific
  earnestMoneyDeposit: number;
  escrowMonths: number;

  // Inspections
  homeInspection: number;
  pestInspection: number;
  windMitigation: number;
  fourPointInspection: number;
}

export interface LineItem {
  lineNumber: number;
  label: string;
  buyerAmount: number;
  sellerAmount: number;
  section: string;
}

export interface ClosingCostResults {
  lineItems: LineItem[];
  buyerTotal: number;
  sellerTotal: number;
  buyerCashToClose: number;
  sellerNetProceeds: number;
}
