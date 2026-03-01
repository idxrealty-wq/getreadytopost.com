const fs = require('fs');
let c = fs.readFileSync('src/app/closing-costs/page.tsx', 'utf8');

const idx = c.indexOf('text-4xl font-bold text-white mb-2');
// Go back to find the '<h1' before it
const h1Start = c.lastIndexOf('<h1', idx);

const banner = `{!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm">\u26A0\uFE0F <strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In \u2192</a>
          </div>
        )}
        `;

c = c.substring(0, h1Start) + banner + c.substring(h1Start);
fs.writeFileSync('src/app/closing-costs/page.tsx', c);
console.log('Done:', c.includes('Sign in to save'));
