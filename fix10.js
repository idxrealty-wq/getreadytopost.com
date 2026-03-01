const fs = require('fs');
let c = fs.readFileSync('src/app/results/results-content.tsx', 'utf8');

const oldEnding = `          </div>
        )}
      </div>
    </main>
  );
}`;

const newEnding = `          </div>
        )}

        {/* Cross-sell section */}
        <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <p className="text-[#c9a227] font-bold text-lg mb-1">🎉 Your description has been upgraded!</p>
            <p className="text-white/80">Take these tools for a spin with your listing data already loaded:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/property-tax" className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group">
              <div className="text-4xl mb-2">🏛️</div>
              <h3 className="text-white font-bold mb-1">Property Tax Estimator</h3>
              <p className="text-gray-400 text-sm">Estimate 2025 Orange County taxes for this property</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Estimator →</p>
            </a>
            <a href="/closing-costs" className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group">
              <div className="text-4xl mb-2">🧮</div>
              <h3 className="text-white font-bold mb-1">Closing Cost Calculator</h3>
              <p className="text-gray-400 text-sm">Full TRID-style buyer & seller cost breakdown</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Calculator →</p>
            </a>
            <a href="/workspace" className="bg-[#1e3a5f] hover:bg-[#2a4f7a] border border-white/20 rounded-xl p-5 text-center transition group">
              <div className="text-4xl mb-2">🏗️</div>
              <h3 className="text-white font-bold mb-1">Agent Workspace</h3>
              <p className="text-gray-400 text-sm">Build your full listing package with AI assistance</p>
              <p className="text-[#c9a227] text-sm mt-2 font-semibold group-hover:underline">Open Workspace →</p>
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}`;

c = c.replace(oldEnding, newEnding);
fs.writeFileSync('src/app/results/results-content.tsx', c);
console.log('Done:', c.includes('description has been upgraded'));
