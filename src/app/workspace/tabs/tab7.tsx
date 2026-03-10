"use client";
export default function Tab7Valuation({ data }: any) {
  const fmt = (v: any) => {
    if (!v || v === '0') return '—';
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return v;
    return '$' + n.toLocaleString();
  };
  const val = (v: any) => (!v || v === '0' || v === '') ? '—' : v;

  const cardClass = "bg-white/5 border border-white/10 rounded-2xl p-6 mb-6";
  const titleClass = "text-lg font-bold text-[#c9a227] mb-4 flex items-center gap-2";
  const rowClass = "flex justify-between items-center py-2 border-b border-white/10";
  const labelClass = "text-gray-400 text-sm";
  const valueClass = "text-white font-semibold text-sm";

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">💰 Valuation & Assessment</h2>

      {/* AVM */}
      <div className={cardClass}>
        <h3 className={titleClass}>🤖 Automated Valuation (AVM)</h3>
        {data.avm_value && data.avm_value !== '0' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-[#c9a227]/20 border border-[#c9a227]/40 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Estimated Value</div>
              <div className="text-[#c9a227] text-2xl font-bold">{fmt(data.avm_value)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">High Range</div>
              <div className="text-green-400 text-xl font-bold">{fmt(data.avm_high)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">Low Range</div>
              <div className="text-red-400 text-xl font-bold">{fmt(data.avm_low)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-gray-400 text-xs mb-1">AVM Date</div>
              <div className="text-white text-sm font-bold">{val(data.avm_date)}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">AVM data not available for this property.</p>
        )}
      </div>

      {/* Assessment */}
      <div className={cardClass}>
        <h3 className={titleClass}>📊 Current Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Assessed Value", value: fmt(data.assessedValue) },
            { label: "Market Value", value: fmt(data.justValue) },
            { label: "Land Value", value: fmt(data.landValue) },
            { label: "Building Value", value: fmt(data.buildingValue) },
            { label: "Taxable Value", value: fmt(data.taxableValue) },
            { label: "Annual Tax", value: fmt(data.annualTax) },
            { label: "Tax Year", value: val(data.taxYear) },
            { label: "Homestead", value: val(data.homestead) },
            { label: "Exemptions", value: val(data.exemptions) },
          ].map((r) => (
            <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className={labelClass}>{r.label}</div>
              <div className={valueClass}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment History */}
      {Array.isArray(data.assessment_history) && data.assessment_history.length > 0 && (
        <div className={cardClass}>
          <h3 className={titleClass}>📈 Assessment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-3 py-2 text-gray-400 text-xs">YEAR</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">ASSESSED</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">MARKET</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">LAND</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">BUILDING</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">TAX</th>
                </tr>
              </thead>
              <tbody>
                {data.assessment_history.map((ah: any, i: number) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2 text-[#c9a227] font-bold text-sm">{ah.year || '—'}</td>
                    <td className="px-3 py-2 text-white text-sm">{fmt(ah.assessed)}</td>
                    <td className="px-3 py-2 text-white text-sm">{fmt(ah.market)}</td>
                    <td className="px-3 py-2 text-white text-sm">{fmt(ah.land)}</td>
                    <td className="px-3 py-2 text-white text-sm">{fmt(ah.building)}</td>
                    <td className="px-3 py-2 text-green-400 text-sm">{fmt(ah.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
