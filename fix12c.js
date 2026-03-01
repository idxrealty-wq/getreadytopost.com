const fs = require('fs');
let c = fs.readFileSync('src/app/agent-vault/page.tsx', 'utf8');

const target = 'Rate My Listing Reports ({reports.length})\r\n          </button>\r\n        </div>';
const replacement = 'Rate My Listing Reports ({reports.length})\r\n          </button>\r\n          <button onClick={() => setTab("closing")} className={`px-6 py-3 font-bold transition ${tab === "closing" ? "text-[#c9a227] border-b-2 border-[#c9a227]" : "text-gray-400 hover:text-white"}`}>\r\n            Closing Costs ({closingEstimates.length})\r\n          </button>\r\n        </div>';

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/app/agent-vault/page.tsx', c);
  console.log('Done:', c.includes('Closing Costs ('));
} else {
  console.log('NOT FOUND');
}
