const fs = require('fs');
let c = fs.readFileSync('src/app/property-tax/page.tsx', 'utf8');
c = c.replace(
  'const cardClass = "bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20";',
  'const cardClass = "bg-[#1e3a5f] rounded-2xl p-8 border border-white/20";'
);
fs.writeFileSync('src/app/property-tax/page.tsx', c);
console.log('DONE:', c.includes('bg-[#1e3a5f]'));
