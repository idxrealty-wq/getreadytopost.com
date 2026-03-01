const fs = require('fs');
let c = fs.readFileSync('src/app/property-tax/page.tsx', 'utf8');

c = c.replace(
  "const allRates = [...COUNTY_RATES, ...(inCity ? [{ label: 'City Millage', mills: cityMillage, group: 'county' as const }] : [])];",
  "const allRates = [...COUNTY_RATES.filter(r => inCity ? !r.label.includes('Unincorporated') : true), ...(inCity ? [{ label: 'City Millage', mills: cityMillage, group: 'county' as const }] : [])];"
);

fs.writeFileSync('src/app/property-tax/page.tsx', c);
console.log('DONE length:' + c.length);
