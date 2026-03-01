const fs = require('fs');
let c = fs.readFileSync('src/app/agent-vault/page.tsx', 'utf8');

// 1. Add ClosingCostEstimate interface after Report interface
c = c.replace(
  `const gradeColor`,
  `interface ClosingCostEstimate {
  id: string;
  address: string;
  salePrice: number;
  results: {
    buyerTotal: number;
    buyerCashToClose: number;
    sellerTotal: number;
    sellerNetProceeds: number;
  };
  savedAt: string;
}

const gradeColor`
);

// 2. Update tab type to include "closing"
c = c.replace(
  `const [tab, setTab] = useState<"listings" | "reports">("listings");`,
  `const [tab, setTab] = useState<"listings" | "reports" | "closing">("listings");`
);

// 3. Add closing cost estimates state after reports state
c = c.replace(
  `const [reports, setReports] = useState<Report[]>([]);`,
  `const [reports, setReports] = useState<Report[]>([]);
  const [closingEstimates, setClosingEstimates] = useState<ClosingCostEstimate[]>([]);`
);

// 4. Add loadClosingEstimates call in useEffect
c = c.replace(
  `      loadListings();
      loadReports();
      fetchCreditBalance();`,
  `      loadListings();
      loadReports();
      loadClosingEstimates();
      fetchCreditBalance();`
);

// 5. Add loadClosingEstimates function after loadReports
c = c.replace(
  `  async function handleDelete`,
  `  async function loadClosingEstimates() {
    if (!user) return;
    try {
      const ref = collection(db, 'users', user.uid, 'closingCostEstimates');
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ClosingCostEstimate));
      data.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
      setClosingEstimates(data);
    } catch (err) {
      console.error('Failed to load closing cost estimates:', err);
    }
  }

  async function handleDelete`
);

// 6. Add the Closing Costs tab button after Reports tab button
c = c.replace(
  `            Rate My Listing Reports ({reports.length})
          </button>
        </div>`,
  `            Rate My Listing Reports ({reports.length})
          </button>
          <button
            onClick={() => setTab("closing")}
            className={\`px-6 py-3 font-bold transition \${
              tab === "closing"
                ? "text-[#c9a227] border-b-2 border-[#c9a227]"
                : "text-gray-400 hover:text-white"
            }\`}
          >
            Closing Costs ({closingEstimates.length})
          </button>
        </div>`
);

// 7. Add closing costs tab content before the final closing tags
c = c.replace(
  `        {tab === "reports" && (`,
  `        {tab === "closing" && (
          <>
            {closingEstimates.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                <div className="text-6xl mb-4">🧮</div>
                <h2 className="text-2xl font-bold text-white mb-3">No Saved Estimates</h2>
                <p className="text-gray-300 mb-6">Run a closing cost calculation and save it to see it here.</p>
                <Link href="/closing-costs" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">
                  Open Calculator
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {closingEstimates.map((est) => (
                  <div key={est.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">{est.address || 'No address'}</h3>
                        <p className="text-gray-400 text-sm">Saved {formatDate(est.savedAt)} • Sale Price: ${est.salePrice?.toLocaleString() || '0'}</p>
                      </div>
                      <Link href={\`/closing-costs?address=\${encodeURIComponent(est.address || '')}&price=\${est.salePrice || 0}\`} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-5 py-2 rounded-xl font-bold text-sm transition whitespace-nowrap">
                        Recalculate
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <div className="bg-blue-600/20 rounded-xl p-3 border border-blue-400/30">
                        <p className="text-blue-300 text-xs font-semibold">Buyer Costs</p>
                        <p className="text-white font-bold">${est.results?.buyerTotal?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
                      </div>
                      <div className="bg-blue-600/20 rounded-xl p-3 border border-blue-400/30">
                        <p className="text-blue-300 text-xs font-semibold">Cash to Close</p>
                        <p className="text-white font-bold">${est.results?.buyerCashToClose?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
                      </div>
                      <div className="bg-green-600/20 rounded-xl p-3 border border-green-400/30">
                        <p className="text-green-300 text-xs font-semibold">Seller Costs</p>
                        <p className="text-white font-bold">${est.results?.sellerTotal?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
                      </div>
                      <div className="bg-green-600/20 rounded-xl p-3 border border-green-400/30">
                        <p className="text-green-300 text-xs font-semibold">Net Proceeds</p>
                        <p className="text-white font-bold">${est.results?.sellerNetProceeds?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "reports" && (`
);

fs.writeFileSync('src/app/agent-vault/page.tsx', c);
console.log('tab type:', c.includes('"closing"'));
console.log('loadClosingEstimates:', c.includes('loadClosingEstimates'));
console.log('Closing Costs tab:', c.includes('Closing Costs ('));
console.log('closingEstimates map:', c.includes('closingEstimates.map'));
