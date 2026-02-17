export default function Tab1PropertyBasics({ data, setData, onNext, address }: any) {
  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const canProceed = address && data.taxId && data.yearBuilt;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">🏠 Property Basics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Tax ID / Parcel Number *</label>
          <input
            type="text"
            value={data.taxId}
            onChange={(e) => updateField('taxId', e.target.value)}
            placeholder="e.g., 12-34-56-7890"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Year Built *</label>
          <input
            type="text"
            value={data.yearBuilt}
            onChange={(e) => updateField('yearBuilt', e.target.value)}
            placeholder="e.g., 2005"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Bedrooms</label>
          <input
            type="text"
            value={data.beds}
            onChange={(e) => updateField('beds', e.target.value)}
            placeholder="e.g., 3"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Bathrooms</label>
          <input
            type="text"
            value={data.baths}
            onChange={(e) => updateField('baths', e.target.value)}
            placeholder="e.g., 2"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Square Feet</label>
          <input
            type="text"
            value={data.sqft}
            onChange={(e) => updateField('sqft', e.target.value)}
            placeholder="e.g., 1,800"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Lot Size</label>
          <input
            type="text"
            value={data.lotSize}
            onChange={(e) => updateField('lotSize', e.target.value)}
            placeholder="e.g., 0.25 acres"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">List Price</label>
          <input
            type="text"
            value={data.price}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="e.g., 350,000"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Key Features</label>
          <input
            type="text"
            value={data.features}
            onChange={(e) => updateField('features', e.target.value)}
            placeholder="Pool, Updated Kitchen, Lake View..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Neighborhood →
        </button>
      </div>
    </div>
  );
}
