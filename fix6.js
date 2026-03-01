const fs = require('fs');
let c = fs.readFileSync('src/app/closing-costs/page.tsx', 'utf8');

// Rename export default function to inner function
c = c.replace(
  'export default function ClosingCostsPage() {',
  'function ClosingCostsContent() {'
);

// Add the wrapper export at the end before the last }
c = c.replace(
  /}\s*$/, 
  `}

export default function ClosingCostsPage() {
  return (
    <Suspense fallback={
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a6f]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </main>
    }>
      <ClosingCostsContent />
    </Suspense>
  );
}`
);

fs.writeFileSync('src/app/closing-costs/page.tsx', c);
console.log('Done. Has ClosingCostsContent:', c.includes('ClosingCostsContent'));
