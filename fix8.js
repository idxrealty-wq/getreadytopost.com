const fs = require('fs');
let c = fs.readFileSync('src/app/closing-costs/page.tsx', 'utf8');

// Update the useState initializer to also check localStorage
c = c.replace(
  `const [inputs, setInputs] = useState<ClosingCostInputs>(() => ({
    ...defaultInputs,
    address: searchParams.get('address') || '',
    salePrice: parseFloat(searchParams.get('price') || '0') || 0,
    annualPropertyTax: parseFloat(searchParams.get('tax') || '0') || 0,
  }));`,
  `const [inputs, setInputs] = useState<ClosingCostInputs>(() => {
    let saved: Record<string, string> = {};
    try { const s = localStorage.getItem('grtp_property'); if (s) saved = JSON.parse(s); } catch(e) {}
    return {
      ...defaultInputs,
      address: searchParams.get('address') || saved.fullAddress || '',
      salePrice: parseFloat(searchParams.get('price') || saved.price || '0') || 0,
      annualPropertyTax: parseFloat(searchParams.get('tax') || '0') || 0,
    };
  });`
);

fs.writeFileSync('src/app/closing-costs/page.tsx', c);
console.log('Done:', c.includes('grtp_property'));
