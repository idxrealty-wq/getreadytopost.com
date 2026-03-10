"use client";
export default function Tab9MortgageOwner({ data }: any) {
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
      <h2 className="text-2xl font-bold text-white mb-6">🏦 Mortgage & Owner</h2>

      {/* Mortgage */}
      <div className={cardClass}>
        <h3 className={titleClass}>🏦 Mortgage Details</h3>
        {data.mortgage_lender && data.mortgage_lender !== '' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Lender", value: val(data.mortgage_lender) },
              { label: "Loan Amount", value: fmt(data.mortgage_amount) },
              { label: "Interest Rate", value: data.mortgage_rate ? `${data.mortgage_rate}%` : '—' },
              { label: "Loan Type", value: val(data.mortgage_type) },
              { label: "Term", value: data.mortgage_term ? `${data.mortgage_term} months` : '—' },
              { label: "Origination Date", value: val(data.mortgage_date) },
              { label: "Due Date", value: val(data.mortgage_due_date) },
              { label: "Title Company", value: val(data.title_company) },
              { label: "Deed Type", value: val(data.deed_type) },
            ].map((r) => (
              <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-gray-400 text-xs">{r.label}</div>
                <div className="text-white font-semibold text-sm">{r.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No mortgage data available for this property.</p>
        )}
      </div>

      {/* Owner Info */}
      <div className={cardClass}>
        <h3 className={titleClass}>👤 Owner Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Owner 1", value: val(data.ownerName) },
            { label: "Owner 2", value: val(data.owner2_name) },
            { label: "Owner Type", value: val(data.owner_type) },
            { label: "Occupancy", value: val(data.absentee_owner) },
            { label: "Mailing Address", value: val(data.mailing_address) },
            { label: "Homestead", value: val(data.homestead) },
            { label: "Exemptions", value: val(data.exemptions) },
          ].map((r) => (
            <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-gray-400 text-xs">{r.label}</div>
              <div className="text-white font-semibold text-sm">{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div className={cardClass}>
        <h3 className={titleClass}>📋 Legal & Parcel</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Parcel ID", value: val(data.taxId) },
            { label: "Legal Description", value: val(data.legalDescription) },
            { label: "Subdivision", value: val(data.subdivision) },
            { label: "Lot Number", value: val(data.lot_num) },
            { label: "Zoning", value: val(data.zoning) },
            { label: "Zoning Code", value: val(data.zoning_code) },
            { label: "DOR Code", value: val(data.dor_uc) },
            { label: "County", value: val(data.county) },
            { label: "Last Modified", value: val(data.dataDate) },
          ].map((r) => (
            <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-gray-400 text-xs">{r.label}</div>
              <div className="text-white font-semibold text-sm">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
