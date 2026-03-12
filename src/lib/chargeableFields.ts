export const CHARGEABLE_FIELDS = [
  // Core Property (keys must match workspace propertyData)
  { key: 'parcelId', label: 'Parcel ID', section: 'Core' },
  { key: 'address', label: 'Address', section: 'Core' },
  { key: 'city', label: 'City', section: 'Core' },
  { key: 'zip', label: 'ZIP', section: 'Core' },
  { key: 'county', label: 'County', section: 'Core' },
  { key: 'yearBuilt', label: 'Year Built', section: 'Core' },
  { key: 'sqft', label: 'Living Sqft', section: 'Core' },
  { key: 'beds', label: 'Beds', section: 'Core' },
  { key: 'baths', label: 'Baths', section: 'Core' },
  { key: 'propertyType', label: 'Property Type', section: 'Core' },
  { key: 'zoning', label: 'Zoning', section: 'Core' },

  // Tax & Assessment
  { key: 'assessedValue', label: 'Assessed Value', section: 'Tax' },
  { key: 'justValue', label: 'Just/Market Value', section: 'Tax' },
  { key: 'landValue', label: 'Land Value', section: 'Tax' },
  { key: 'buildingValue', label: 'Building Value', section: 'Tax' },
  { key: 'taxableValue', label: 'Taxable Value', section: 'Tax' },
  { key: 'annualTax', label: 'Annual Tax', section: 'Tax' },
  { key: 'taxYear', label: 'Tax Year', section: 'Tax' },

  // Owner
  { key: 'ownerName', label: 'Owner Name', section: 'Owner' },
  { key: 'owner2Name', label: 'Owner 2', section: 'Owner' },
  { key: 'ownerType', label: 'Owner Type', section: 'Owner' },
  { key: 'absenteeOwner', label: 'Occupancy Status', section: 'Owner' },
  { key: 'mailingAddress', label: 'Mailing Address', section: 'Owner' },

  // Sale
  { key: 'lastSalePrice', label: 'Last Sale Price', section: 'Sale' },
  { key: 'saleDate', label: 'Sale Date', section: 'Sale' },
  { key: 'saleTransType', label: 'Sale Type', section: 'Sale' },
  { key: 'sellerName', label: 'Seller Name', section: 'Sale' },
  { key: 'saleHistory', label: 'Sale History (Table)', section: 'Sale', isArray: true },

  // AVM
  { key: 'avmValue', label: 'AVM Value', section: 'AVM' },
  { key: 'avmLow', label: 'AVM Low', section: 'AVM' },
  { key: 'avmHigh', label: 'AVM High', section: 'AVM' },
  { key: 'avmConfidence', label: 'AVM Confidence', section: 'AVM' },
  { key: 'avmDate', label: 'AVM Date', section: 'AVM' },

  // Mortgage
  { key: 'mortgageLender', label: 'Mortgage Lender', section: 'Mortgage' },
  { key: 'mortgageAmount', label: 'Mortgage Amount', section: 'Mortgage' },
  { key: 'mortgageRate', label: 'Mortgage Rate', section: 'Mortgage' },
  { key: 'mortgageType', label: 'Mortgage Type', section: 'Mortgage' },
  { key: 'mortgageTerm', label: 'Mortgage Term', section: 'Mortgage' },
  { key: 'mortgageDate', label: 'Mortgage Date', section: 'Mortgage' },
  { key: 'mortgageDueDate', label: 'Mortgage Due Date', section: 'Mortgage' },

  // Assessment History
  { key: 'assessmentHistory', label: 'Assessment History (Table)', section: 'History', isArray: true },

  // Building Permits
  { key: 'buildingPermits', label: 'Building Permits (Table)', section: 'Permits', isArray: true },

  // Schools
  { key: 'schoolDistrict', label: 'School District', section: 'Schools' },
  { key: 'schoolDistrictType', label: 'School District Type', section: 'Schools' },
  { key: 'schools', label: 'Schools (Table)', section: 'Schools', isArray: true },
] as const;

export const SECTIONS = ['Core', 'Tax', 'Owner', 'Sale', 'AVM', 'Mortgage', 'History', 'Permits', 'Schools'] as const;
