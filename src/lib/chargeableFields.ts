export const CHARGEABLE_FIELDS = [
  // Core Property
  { key: 'parcel_id', label: 'Parcel ID', section: 'Core' },
  { key: 'address', label: 'Address', section: 'Core' },
  { key: 'city', label: 'City', section: 'Core' },
  { key: 'zip', label: 'ZIP', section: 'Core' },
  { key: 'county', label: 'County', section: 'Core' },
  { key: 'year_built', label: 'Year Built', section: 'Core' },
  { key: 'sqft', label: 'Living Sqft', section: 'Core' },
  { key: 'beds', label: 'Beds', section: 'Core' },
  { key: 'baths', label: 'Baths', section: 'Core' },
  { key: 'property_type', label: 'Property Type', section: 'Core' },
  { key: 'zoning', label: 'Zoning', section: 'Core' },
  
  // Tax & Assessment
  { key: 'assessed_value', label: 'Assessed Value', section: 'Tax' },
  { key: 'just_value', label: 'Just/Market Value', section: 'Tax' },
  { key: 'land_value', label: 'Land Value', section: 'Tax' },
  { key: 'building_value', label: 'Building Value', section: 'Tax' },
  { key: 'taxable_value', label: 'Taxable Value', section: 'Tax' },
  { key: 'annual_tax', label: 'Annual Tax', section: 'Tax' },
  { key: 'tax_year', label: 'Tax Year', section: 'Tax' },
  
  // Owner
  { key: 'owner_name', label: 'Owner Name', section: 'Owner' },
  { key: 'owner2_name', label: 'Owner 2', section: 'Owner' },
  { key: 'owner_type', label: 'Owner Type', section: 'Owner' },
  { key: 'absentee_owner', label: 'Occupancy Status', section: 'Owner' },
  { key: 'mailing_address', label: 'Mailing Address', section: 'Owner' },
  
  // Sale
  { key: 'sale_price', label: 'Last Sale Price', section: 'Sale' },
  { key: 'sale_date', label: 'Sale Date', section: 'Sale' },
  { key: 'sale_trans_type', label: 'Sale Type', section: 'Sale' },
  { key: 'seller_name', label: 'Seller Name', section: 'Sale' },
  { key: 'sale_history', label: 'Sale History (Table)', section: 'Sale', isArray: true },
  
  // AVM
  { key: 'avm_value', label: 'AVM Value', section: 'AVM' },
  { key: 'avm_low', label: 'AVM Low', section: 'AVM' },
  { key: 'avm_high', label: 'AVM High', section: 'AVM' },
  { key: 'avm_confidence', label: 'AVM Confidence', section: 'AVM' },
  { key: 'avm_date', label: 'AVM Date', section: 'AVM' },
  
  // Mortgage
  { key: 'mortgage_lender', label: 'Mortgage Lender', section: 'Mortgage' },
  { key: 'mortgage_amount', label: 'Mortgage Amount', section: 'Mortgage' },
  { key: 'mortgage_rate', label: 'Mortgage Rate', section: 'Mortgage' },
  { key: 'mortgage_type', label: 'Mortgage Type', section: 'Mortgage' },
  { key: 'mortgage_term', label: 'Mortgage Term', section: 'Mortgage' },
  { key: 'mortgage_date', label: 'Mortgage Date', section: 'Mortgage' },
  
  // Assessment History
  { key: 'assessment_history', label: 'Assessment History (Table)', section: 'History', isArray: true },
  
  // Building Permits
  { key: 'building_permits', label: 'Building Permits (Table)', section: 'Permits', isArray: true },
  
  // Schools
  { key: 'schools', label: 'Schools (Table)', section: 'Schools', isArray: true },
];

export const SECTIONS = ['Core', 'Tax', 'Owner', 'Sale', 'AVM', 'Mortgage', 'History', 'Permits', 'Schools'];
