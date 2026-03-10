"use client";
export default function Tab8History({ data }: any) {
  const fmt = (v: any) => {
    if (!v || v === '0') return '—';
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return v;
    return '$' + n.toLocaleString();
  };
  const val = (v: any) => (!v || v === '0' || v === '') ? '—' : v;
  const cardClass = "bg-white/5 border border-white/10 rounded-2xl p-6 mb-6";
  const titleClass = "text-lg font-bold text-[#c9a227] mb-4 flex items-center gap-2";

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">📈 Sale History & Permits</h2>

      {/* Sale History */}
      <div className={cardClass}>
        <h3 className={titleClass}>🏷️ Sale History</h3>
        {Array.isArray(data.sale_history) && data.sale_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-3 py-2 text-gray-400 text-xs">DATE</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">PRICE</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">BUYER</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">SELLER</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">TYPE</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">DOC TYPE</th>
                </tr>
              </thead>
              <tbody>
                {data.sale_history.map((sh: any, i: number) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2 text-[#c9a227] text-sm">{val(sh.date)}</td>
                    <td className="px-3 py-2 text-green-400 font-bold text-sm">{fmt(sh.price)}</td>
                    <td className="px-3 py-2 text-white text-sm">{val(sh.buyer)}</td>
                    <td className="px-3 py-2 text-white text-sm">{val(sh.seller)}</td>
                    <td className="px-3 py-2 text-gray-300 text-sm">{val(sh.type)}</td>
                    <td className="px-3 py-2 text-gray-300 text-sm">{val(sh.docType)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No sale history available for this property.</p>
        )}
      </div>

      {/* Current Sale Info */}
      <div className={cardClass}>
        <h3 className={titleClass}>🏠 Current Sale Info</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Last Sale Price", value: fmt(data.lastSalePrice) },
            { label: "Sale Date", value: val(data.sale_date) },
            { label: "Sale Year", value: val(data.lastSaleYear) },
            { label: "Price Per Sqft", value: fmt(data.price_per_sqft) },
            { label: "Price Per Bed", value: fmt(data.price_per_bed) },
            { label: "Sale Type", value: val(data.sale_trans_type) },
            { label: "Doc Type", value: val(data.sale_doc_type) },
            { label: "Seller", value: val(data.seller_name) },
            { label: "Title Company", value: val(data.title_company) },
            { label: "Deed Type", value: val(data.deed_type) },
          ].map((r) => (
            <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-gray-400 text-xs">{r.label}</div>
              <div className="text-white font-semibold text-sm">{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Permits */}
      <div className={cardClass}>
        <h3 className={titleClass}>🔨 Building Permits</h3>
        {Array.isArray(data.building_permits) && data.building_permits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-3 py-2 text-gray-400 text-xs">DATE</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">TYPE</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">DESCRIPTION</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">STATUS</th>
                  <th className="px-3 py-2 text-gray-400 text-xs">COST</th>
                </tr>
              </thead>
              <tbody>
                {data.building_permits.map((bp: any, i: number) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2 text-[#c9a227] text-sm">{val(bp.date)}</td>
                    <td className="px-3 py-2 text-white text-sm">{val(bp.type)}</td>
                    <td className="px-3 py-2 text-gray-300 text-sm max-w-xs truncate">{val(bp.description)}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${bp.status?.toLowerCase().includes('final') ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {val(bp.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-green-400 text-sm">{fmt(bp.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No building permits found for this property.</p>
        )}
      </div>
    </div>
  );
}
