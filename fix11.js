const fs = require('fs');
let c = fs.readFileSync('src/app/closing-costs/page.tsx', 'utf8');

// 1. Add imports
c = c.replace(
  `import { useState, useEffect, Suspense } from 'react';`,
  `import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';`
);

// 2. Add useUser hook after const set =
c = c.replace(
  `  const set = (field: keyof ClosingCostInputs, value: any) => setInputs(prev => ({ ...prev, [field]: value }));`,
  `  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (field: keyof ClosingCostInputs, value: any) => setInputs(prev => ({ ...prev, [field]: value }));`
);

// 3. Add handleSaveToVault function after handleCalculate
c = c.replace(
  `  const inputClass =`,
  `  const handleSaveToVault = async () => {
    if (!user || !results) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'closingCostEstimates'), {
        address: inputs.address,
        salePrice: inputs.salePrice,
        inputs,
        results: {
          buyerTotal: results.buyerTotal,
          buyerCashToClose: results.buyerCashToClose,
          sellerTotal: results.sellerTotal,
          sellerNetProceeds: results.sellerNetProceeds,
        },
        savedAt: new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      console.error('Save error:', e);
      alert('Error saving to vault');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =`
);

// 4. Add sign-in warning banner after the opening <main> tag
c = c.replace(
  `        <h1 className="text-4xl font-bold text-white mb-2 text-center">🏠 Closing Cost Calculator</h1>`,
  `        {!user && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-yellow-200 text-sm">⚠️ <strong>Sign in</strong> to save your estimates to the Vault for later reference.</p>
            <a href="/signin" className="text-yellow-300 font-bold text-sm underline hover:text-yellow-100 whitespace-nowrap">Sign In →</a>
          </div>
        )}
        <h1 className="text-4xl font-bold text-white mb-2 text-center">🏠 Closing Cost Calculator</h1>`
);

// 5. Add Save to Vault button after the Start New Calculation button
c = c.replace(
  `            <button onClick={() => { setStep(0); setResults(null); setInputs(defaultInputs); }} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">
              ← Start New Calculation
            </button>`,
  `            {user && (
              <button
                onClick={handleSaveToVault}
                disabled={saving || saved}
                className={\`w-full py-4 rounded-xl font-bold transition \${saved ? 'bg-green-600 text-white cursor-default' : 'bg-[#c9a227] hover:bg-[#b8911f] text-white'}\`}
              >
                {saving ? '💾 Saving...' : saved ? '✓ Saved to Vault!' : '💾 Save to Vault'}
              </button>
            )}
            {!user && (
              <div className="w-full py-4 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-center text-yellow-200 text-sm">
                ⚠️ <a href="/signin" className="underline font-bold hover:text-yellow-100">Sign in</a> to save this estimate to your Vault
              </div>
            )}
            <button onClick={() => { setStep(0); setResults(null); setInputs(defaultInputs); setSaved(false); }} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">
              ← Start New Calculation
            </button>`
);

fs.writeFileSync('src/app/closing-costs/page.tsx', c);
console.log('useUser:', c.includes('useUser'));
console.log('handleSaveToVault:', c.includes('handleSaveToVault'));
console.log('Sign in banner:', c.includes('Sign in to save'));
console.log('Save button:', c.includes('Save to Vault'));
