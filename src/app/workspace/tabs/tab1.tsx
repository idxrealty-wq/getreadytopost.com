"use client";
import { useEffect } from 'react';
export default function Tab1PropertyBasics({ data, setData, onNext, address }: any) {
  useEffect(() => {
    if (!data.dateAdded) {
      const today = new Date().toISOString().split('T')[0];
      setData((prev: any) => ({ ...prev, dateAdded: today }));
    }
  }, []);
  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };
  const canProceed = address && data.taxId && data.yearBuilt;
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-white text-gray-900";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none bg-white text-gray-900";
  const labelClass = "block text-gray-300 text-sm font-bold mb-2";
  const sectionClass = "bg-white/5 border border-white/10 rounded-2xl p-6 mb-6";
  const sectionTitle = "text-lg font-bold text-[#c9a227] mb-4 flex items-center gap-2";
  const formatCurrency = (val: string) => {
    if (!val) return '';
    const num = Number(String(val).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return val;
    return '$' + num.toLocaleString();
  };
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Property Basics</h2>
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Core Property Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Date Added</label>
            <input type="date" value={data.dateAdded || ''} onChange={(e) => updateField('dateAdded', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tax ID / Parcel Number *</label>
            <input type="text" value={data.taxId || ''} onChange={(e) => updateField('taxId', e.target.value)} placeholder="e.g., 12-34-56-7890" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <select value={data.propertyType || ''} onChange={(e) => updateField('propertyType', e.target.value)} className={selectClass}>
              <option value="">Select type...</option>
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhome">Townhome</option>
              <option value="Multi-Family">Multi-Family</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
              <option value="Mobile Home">Mobile Home</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Zoning</label>
            <input type="text" value={data.zoning || ''} onChange={(e) => updateField('zoning', e.target.value)} placeholder="e.g., R-1, R-2, PD, A-1, C-1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Year Built *</label>
            <input type="text" value={data.yearBuilt || ''} onChange={(e) => updateField('yearBuilt', e.target.value)} placeholder="e.g., 2005" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>List Price</label>
            <input type="text" value={formatCurrency(data.price)} onChange={(e) => updateField('price', e.target.value)} placeholder="e.g., 350,000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bedrooms</label>
            <input type="text" value={data.beds || ''} onChange={(e) => updateField('beds', e.target.value)} placeholder="e.g., 3" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bathrooms</label>
            <input type="text" value={data.baths || ''} onChange={(e) => updateField('baths', e.target.value)} placeholder="e.g., 2" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Square Feet (Living)</label>
            <input type="text" value={data.sqft || ''} onChange={(e) => updateField('sqft', e.target.value)} placeholder="e.g., 1,800" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Lot Size</label>
            <input type="text" value={data.lotSize || ''} onChange={(e) => updateField('lotSize', e.target.value)} placeholder="e.g., 0.25 acres or 10,890 sqft" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stories</label>
            <select value={data.stories || ''} onChange={(e) => updateField('stories', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="1">1 Story</option>
              <option value="2">2 Stories</option>
              <option value="3">3+ Stories</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Garage</label>
            <select value={data.garage || ''} onChange={(e) => updateField('garage', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="None">None</option>
              <option value="1-Car">1-Car</option>
              <option value="2-Car">2-Car</option>
              <option value="3-Car">3-Car</option>
              <option value="Carport">Carport</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Pool</label>
            <select value={data.pool || ''} onChange={(e) => updateField('pool', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="None">None</option>
              <option value="In-Ground">In-Ground</option>
              <option value="Above-Ground">Above-Ground</option>
              <option value="In-Ground + Spa">In-Ground + Spa</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Construction Type</label>
            <select value={data.construction || ''} onChange={(e) => updateField('construction', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="CBS (Concrete Block)">CBS (Concrete Block)</option>
              <option value="Frame">Frame</option>
              <option value="Brick">Brick</option>
              <option value="Stucco">Stucco</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>School District</label>
            <input type="text" value={data.schoolDistrict || ''} onChange={(e) => updateField('schoolDistrict', e.target.value)} placeholder="e.g., Orange County Public Schools" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Key Features</label>
            <textarea value={data.features || ''} onChange={(e) => updateField('features', e.target.value)} placeholder="Updated kitchen, lake view, new roof..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none bg-white text-gray-900" />
          </div>
          <div className="md:col-span-2">
            {data.propertyLink && (
              <div className="mb-2">
                <a href={data.propertyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition">
                  View Full Parcel Details on Orange County Appraiser
                </a>
                <p className="text-gray-500 text-xs mt-1">Use this to find the legal description and other details</p>
              </div>
            )}
            <label className={labelClass}>Legal Description</label>
            <textarea value={data.legalDescription || ''} onChange={(e) => updateField('legalDescription', e.target.value)} placeholder="e.g., LOT 4, BLOCK 12, TAVARES HEIGHTS SUBDIVISION..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#c9a227] focus:outline-none resize-none bg-white text-gray-900" />
          </div>
        </div>
      </div>
      <div className={sectionClass}>
        <h3 className={sectionTitle}>HOA & Community</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>HOA</label>
            <select value={data.hoa || ''} onChange={(e) => updateField('hoa', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="None">None</option>
              <option value="Yes - Voluntary">Yes - Voluntary</option>
              <option value="Yes - Mandatory">Yes - Mandatory</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>HOA Monthly Amount</label>
            <input type="text" value={formatCurrency(data.hoaAmount)} onChange={(e) => updateField('hoaAmount', e.target.value)} placeholder="e.g., $150/month" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>HOA Name</label>
            <input type="text" value={data.hoaName || ''} onChange={(e) => updateField('hoaName', e.target.value)} placeholder="e.g., Lakeside Estates HOA" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Community Amenities</label>
            <input type="text" value={data.amenities || ''} onChange={(e) => updateField('amenities', e.target.value)} placeholder="e.g., Pool, Tennis, Clubhouse" className={inputClass} />
          </div>
        </div>
      </div>
      <div className={sectionClass}>
        <h3 className={sectionTitle}>Florida-Specific Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Flood Zone</label>
            <select value={data.floodZone || ''} onChange={(e) => updateField('floodZone', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="X (No flood risk)">X (No flood risk)</option>
              <option value="AE (High risk)">AE (High risk)</option>
              <option value="AH">AH</option>
              <option value="VE (Coastal high risk)">VE (Coastal high risk)</option>
              <option value="A">A</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Water</label>
            <select value={data.water || ''} onChange={(e) => updateField('water', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="Public">Public</option>
              <option value="Well">Well</option>
              <option value="Community Well">Community Well</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sewer</label>
            <select value={data.sewer || ''} onChange={(e) => updateField('sewer', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="Public">Public</option>
              <option value="Septic">Septic</option>
              <option value="Community Septic">Community Septic</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Roof Year</label>
            <input type="text" value={data.roofYear || ''} onChange={(e) => updateField('roofYear', e.target.value)} placeholder="e.g., 2018" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>AC Year</label>
            <input type="text" value={data.acYear || ''} onChange={(e) => updateField('acYear', e.target.value)} placeholder="e.g., 2020" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Water Heater Year</label>
            <input type="text" value={data.waterHeaterYear || ''} onChange={(e) => updateField('waterHeaterYear', e.target.value)} placeholder="e.g., 2019" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Owner Name</label>
            <input type="text" value={(data as any).ownerName || ''} onChange={(e) => updateField('ownerName', e.target.value)} placeholder="e.g., SMITH JOHN A" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Assessed Value (County)</label>
            <input type="text" value={formatCurrency(data.assessedValue)} onChange={(e) => updateField('assessedValue', e.target.value)} placeholder="e.g., $285,000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Sale Price</label>
            <input type="text" value={formatCurrency(data.lastSalePrice)} onChange={(e) => updateField('lastSalePrice', e.target.value)} placeholder="e.g., $310,000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last Sale Year</label>
            <input type="text" value={data.lastSaleYear || ''} onChange={(e) => updateField('lastSaleYear', e.target.value)} placeholder="e.g., 2021" className={inputClass} />
          </div>
            <div>
              <label className={labelClass}>Just / Market Value</label>
              <input type="text" value={formatCurrency((data as any).justValue)} onChange={(e) => updateField('justValue', e.target.value)} placeholder="e.g., $350,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Land Value</label>
              <input type="text" value={formatCurrency((data as any).landValue)} onChange={(e) => updateField('landValue', e.target.value)} placeholder="e.g., $85,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Building Value</label>
              <input type="text" value={formatCurrency((data as any).buildingValue)} onChange={(e) => updateField('buildingValue', e.target.value)} placeholder="e.g., $265,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Taxable Value</label>
              <input type="text" value={formatCurrency((data as any).taxableValue)} onChange={(e) => updateField('taxableValue', e.target.value)} placeholder="e.g., $300,000" className={inputClass} />
            </div>

          <div>
            <label className={labelClass}>Homestead Exemption</label>
            <select value={data.homestead || ''} onChange={(e) => updateField('homestead', e.target.value)} className={selectClass}>
              <option value="">Select...</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition disabled:opacity-50"
        >
          Next: Neighborhood
        </button>
      </div>
    </div>
  );
}

