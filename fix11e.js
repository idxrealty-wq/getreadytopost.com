const fs = require('fs');
let c = fs.readFileSync('src/app/closing-costs/page.tsx', 'utf8');

const idx = c.indexOf('<h1 className');
console.log('h1 at:', idx);

const banner = `{!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm"><strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In</a>
          </div>
        )}
        `;

c = c.substring(0, idx) + banner + c.substring(idx);
fs.writeFileSync('src/app/closing-costs/page.tsx', c);
console.log('banner:', c.includes('Sign in to save'));
console.log('Sign in text:', c.includes('Sign in'));
