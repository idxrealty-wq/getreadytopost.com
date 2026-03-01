const fs = require('fs');
let c = fs.readFileSync('src/app/property-tax/page.tsx', 'utf8');

// Add localStorage read after the useState declarations
c = c.replace(
  "const [calculated, setCalculated] = useState(false);",
  `const [calculated, setCalculated] = useState(false);

  // Read from localStorage on mount
  useState(() => {
    try {
      const saved = localStorage.getItem('grtp_property');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.address) setAddress(p.address + (p.city ? ', ' + p.city : '') + (p.state ? ', ' + p.state : ''));
        if (p.price) { setMarketValue(parseFloat(p.price)); setAssessedValue(parseFloat(p.price)); }
      }
    } catch(e) {}
  });`
);

fs.writeFileSync('src/app/property-tax/page.tsx', c);
console.log('Done:', c.includes('grtp_property'));
