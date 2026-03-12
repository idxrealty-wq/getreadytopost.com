export const CHARGEABLE_FIELDS = [
  // Core Property
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
  { key: 'zoningCode', label: 'Zoning Code', section: 'Core' },
  { key: 'subdivision', label: 'Subdivision', section: 'Core' },
  { key: 'lotNum', label: 'Lot Number', section: 'Core' },
  { key: 'acres', label: 'Acres', section: 'Core' },
  { key: 'stories', label: 'Stories', section: 'Core' },
  { key: 'construction', label: 'Construction Type', section: 'Core' },
  { key: 'condition', label: 'Condition', section: 'Core' },
  { key: 'roofCover', label: 'Roof Cover', section: 'Core' },
  { key: 'roofShape', label: 'Roof Shape', section: 'Core' },
  { key: 'wallType', label: 'Wall Type', section: 'Core' },
  { key: 'garage', label: 'Garage', section: 'Core' },
  { key: 'garageSqft', label: 'Garage Sqft', section: 'Core' },
  { key: 'pool', label: 'Pool', section: 'Core' },
  { key: 'fireplace', label: 'Fireplace', section: 'Core' },
  { key: 'heatingType', label: 'Heating Type', section: 'Core' },
  { key: 'heatingFuel', label: 'Heating Fuel', section: 'Core' },
  { key: 'cooling', label: 'Cooling', section: 'Core' },
  { key: 'improvementsYear', label: 'Improvements Year', section: 'Core' },
  { key: 'legalDescription', label: 'Legal Description', section: 'Core' },
  { key: 'dorUc', label: 'DOR Use Code', section: 'Core' },

  // Tax & Assessment
  { key: 'assessedValue', label: 'Assessed Value', section: 'Tax' },
  { key: 'justValue', label: 'Just/Market Value', section: 'Tax' },
  { key: 'landValue', label: 'Land Value', section: 'Tax' },
  { key: 'buildingValue', label: 'Building Value', section: 'Tax' },
  { key: 'taxableValue', label: 'Taxable Value', section: 'Tax' },
  { key: 'annualTax', label: 'Annual Tax', section: 'Tax' },
  { key: 'taxYear', label: 'Tax Year', section: 'Tax' },
  { key: 'homestead', label: 'Homestead Exemption', section: 'Tax' },
  { key: 'exemptions', label: 'Tax Exemptions', section: 'Tax' },

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
  { key: 'deedType', label: 'Deed Type', section: 'Sale' },
  { key: 'titleCompany', label: 'Title Company', section: 'Sale' },
  { key: 'pricePerSqft', label: 'Price Per Sqft', section: 'Sale' },
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

  // Flood
  { key: 'floodZone', label: 'Flood Zone', section: 'Flood' },
  { key: 'floodSubtype', label: 'Flood Subtype', section: 'Flood' },
  { key: 'floodSFHA', label: 'Special Flood Hazard Area', section: 'Flood' },

  // Assessment History
  { key: 'assessmentHistory', label: 'Assessment History (Table)', section: 'History', isArray: true },

  // Building Permits
  { key: 'buildingPermits', label: 'Building Permits (Table)', section: 'Permits', isArray: true },

  // Schools
  { key: 'schoolDistrict', label: 'School District', section: 'Schools' },
  { key: 'schoolDistrictType', label: 'School District Type', section: 'Schools' },
  { key: 'schools', label: 'Schools (Table)', section: 'Schools', isArray: true },

  // Coming Soon (not yet pulled from ATTOM or other sources)
  { key: 'hoa', label: 'HOA', section: 'Coming Soon' },
  { key: 'hoaAmount', label: 'HOA Monthly Amount', section: 'Coming Soon' },
  { key: 'hoaName', label: 'HOA Name', section: 'Coming Soon' },
  { key: 'water', label: 'Water Source', section: 'Coming Soon' },
  { key: 'sewer', label: 'Sewer Type', section: 'Coming Soon' },
  { key: 'roofYear', label: 'Roof Year', section: 'Coming Soon' },
  { key: 'acYear', label: 'AC Year', section: 'Coming Soon' },
  { key: 'waterHeaterYear', label: 'Water Heater Year', section: 'Coming Soon' },
  { key: 'amenities', label: 'Community Amenities', section: 'Coming Soon' },
  { key: 'virtualTourUrl', label: 'Virtual Tour URL', section: 'Coming Soon' },
] as const;

export const SECTIONS = [
  'Core', 'Tax', 'Owner', 'Sale', 'AVM', 'Mortgage',
  'Flood', 'History', 'Permits', 'Schools', 'Coming Soon'
] as const;
