const fs = require('fs');
let c = fs.readFileSync('src/app/property-tax/page.tsx', 'utf8');

const oldBlock = '<div className="ml-8 max-w-xs">';
const newBlock = '<div className="ml-8 space-y-4">';

// Fix the label
c = c.replace('Save Our Homes / County Exemption Amount ($) <span className="text-gray-400 font-normal text-xs">default $55,722</span>', 'Additional Homestead (Hx) / SOH Cap <span className="text-gray-400 font-normal text-xs">default $25,722 — verify at ocpafl.org</span>');

// Fix the help text and add checkboxes after it
c = c.replace(
  '<p className="text-gray-400 text-xs mt-1">Schools get $25,000 exemption. County/Fire/Library get this amount.</p>\n              </div>',
  `<p className="text-gray-400 text-xs mt-1">County gets $25,000 + this amount. Schools get $25,000 + other exemptions only.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Other Exemptions <span className="text-gray-400 font-normal text-xs">check all that apply</span></label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 text-white cursor-pointer text-sm"><input type="checkbox" checked={seniorExemption} onChange={e => setSeniorExemption(e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />Senior Exemption (+$5,000)</label>
                    <label className="flex items-center gap-3 text-white cursor-pointer text-sm"><input type="checkbox" checked={disabilityExemption} onChange={e => setDisabilityExemption(e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />Total &amp; Permanent Disability (+$5,000)</label>
                    <label className="flex items-center gap-3 text-white cursor-pointer text-sm"><input type="checkbox" checked={veteranExemption} onChange={e => setVeteranExemption(e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />Veteran Disability (+$5,000)</label>
                    <label className="flex items-center gap-3 text-white cursor-pointer text-sm"><input type="checkbox" checked={widowExemption} onChange={e => setWidowExemption(e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />Widow / Widower (+$500)</label>
                    <label className="flex items-center gap-3 text-white cursor-pointer text-sm"><input type="checkbox" checked={blindExemption} onChange={e => setBlindExemption(e.target.checked)} className="w-4 h-4 accent-[#c9a227]" />Blind Person (+$500)</label>
                  </div>
                </div>
              </div>`
);

fs.writeFileSync('src/app/property-tax/page.tsx', c);
console.log('DONE length:' + c.length);
