// Rule-based missing info detector (no AI, no regex)
export interface MissingInfoResult {
  missingFields: string[];
  percentToA: number;
  suggestions: string[];
  hasAddress: boolean;
}

const KEYWORDS = {
  sqft: ["sqft", "square feet", "sf", "sq ft"],
  beds: ["bed", "bedroom", "1br", "2br", "3br", "4br", "5br"],
  baths: ["bath", "bathroom", "1ba", "2ba", "3ba"],
  yearBuilt: ["built", "year built", "1990", "2000", "2010", "2020"],
  kitchen: ["kitchen", "granite", "stainless", "updated kitchen", "remodeled kitchen"],
  upgrades: ["upgrade", "remodel", "renovated", "new", "recently"],
  hoa: ["hoa", "homeowners", "association", "monthly fee"],
  lotSize: ["lot", "acre", "lot size"],
  neighborhood: ["neighborhood", "area", "community", "location", "near", "close to"],
  cta: ["call", "contact", "schedule", "showing", "visit", "tour"],
};

export function checkMissingInfo(listingText: string): MissingInfoResult {
  const textLower = listingText.toLowerCase();
  const missingFields: string[] = [];
  let foundCount = 0;
  const totalCategories = Object.keys(KEYWORDS).length;

  // Check each category
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    const found = keywords.some((keyword) => textLower.includes(keyword));
    if (found) {
      foundCount++;
    } else {
      // Map to user-friendly names
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
      missingFields.push(friendlyNames[category] || category);
    }
  }

  const percentToA = Math.round((foundCount / totalCategories) * 100);

  // Generate suggestions based on what's missing
  const suggestions: string[] = [];
  if (missingFields.includes("Square footage")) suggestions.push("Add square footage");
  if (missingFields.includes("Year built")) suggestions.push("Include year built or renovation date");
  if (missingFields.includes("Kitchen details")) suggestions.push("Describe kitchen condition/upgrades");
  if (missingFields.includes("Recent upgrades")) suggestions.push("Highlight recent renovations");
  if (missingFields.includes("Neighborhood highlights")) suggestions.push("Add neighborhood perks (parks, schools, transit)");
  if (missingFields.includes("Call-to-action")) suggestions.push("End with a clear CTA");

  return {
    missingFields,
    percentToA,
    suggestions,
    hasAddress: false, // Will update when we add address field
  };
}
