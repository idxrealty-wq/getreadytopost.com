const fs = require('fs');

let pt = fs.readFileSync('src/app/property-tax/page.tsx', 'utf8');
pt = pt.replace(
  'href="/closing-costs" className="bg-green-600',
  'href={`/closing-costs?address=${encodeURIComponent(address)}&price=${marketValue}&tax=${Math.round(annualTax)}`} className="bg-green-600'
);
fs.writeFileSync('src/app/property-tax/page.tsx', pt);
console.log('Updated:', pt.includes('encodeURIComponent'));
