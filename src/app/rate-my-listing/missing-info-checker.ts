export interface MissingInfoResult {
  missingFields: string[];
  percentToA: number;
  suggestions: string[];
  hasAddress: boolean;
}

export interface FormFields {
  beds?: string;
  baths?: string;
  sqft?: string;
  yearBuilt?: string;
  price?: string;
}

const KEYWORDS: Record<string, string[]> = {
  sqft: ["sqft", "square feet", "sf", "sq ft"],
  beds: ["bed", "bedroom", "1br", "2br", "3br", "4br", "5br"],
  baths: ["bath", "bathroom", "1ba", "2ba", "3ba"],
  yearBuilt: ["built", "year built", "1990", "2000", "2010", "2020", "2021", "2022", "2023", "2024"],
  kitchen: ["kitchen", "granite", "stainless", "updated kitchen", "remodeled kitchen"],
  upgrades: ["upgrade", "remodel", "renovated", "new", "recently"],
  hoa: ["hoa", "homeowners", "association", "monthly fee"],
  lotSize: ["lot", "acre", "lot size"],
  neighborhood: ["neighborhood", "area", "community", "location", "near", "close to"],
  cta: ["call", "contact", "schedule", "showing", "visit", "tour"],
};

const friendlyNames: Record<string, string> = {
  sqft: "Square footage",
  beds: "Beds/baths",
  baths: "Baths",
  yearBuilt: "Year built",
  kitchen: "Kitchen details",
  upgrades: "Recent upgrades",
  hoa: "HOA info",
  lotSize: "Lot size",
  neighborhood: "Neighborhood highlights",
  cta: "Call-to-action",
};

export function checkMissingInfo(listingText: string, fields?: FormFields): MissingInfoResult {
  const textLower = listingText.toLowerCase();
  const missingFields: string[] = [];
  let foundCount = 0;
  const totalCategories = Object.keys(KEYWORDS).length;

  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    let found = keywords.some((keyword) => textLower.includes(keyword));

    if (!found && fields) {
      if (category === 'sqft' && fields.sqft) found = true;
      if (category === 'beds' && fields.beds) found = true;
      if (category === 'baths' && fields.baths) found = true;
      if (category === 'yearBuilt' && fields.yearBuilt) found = true;
    }

    if (found) {
      foundCount++;
    } else {
      missingFields.push(friendlyNames[category] || category);
    }
  }

  const percentToA = Math.round((foundCount / totalCategories) * 100);

  const suggestions: string[] = [];
  if (missingFields.includes("Square footage")) suggestions.push("Add square footage");
  if (missingFields.includes("Year built")) suggestions.push("Include year built or renovation date");
  if (missingFields.includes("Kitchen details")) suggestions.push("Describe kitchen condition/upgrades");
  if (missingFields.includes("Recent upgrades")) suggestions.push("Highlight recent renovations");
  if (missingFields.includes("Neighborhood highlights")) suggestions.push("Add neighborhood perks");
  if (missingFields.includes("Call-to-action")) suggestions.push("End with a clear CTA");

  return { missingFields, percentToA, suggestions, hasAddress: false };
}
