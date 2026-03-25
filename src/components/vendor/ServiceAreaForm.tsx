'use client';

import { useState } from 'react';
import { ServiceArea } from '@/types/service-areas';
import { X } from 'lucide-react';

interface ServiceAreaFormProps {
  onSubmit: (area: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: ServiceArea;
  vendorId: string;
}

export default function ServiceAreaForm({
  onSubmit,
  onCancel,
  initialData,
  vendorId,
}: ServiceAreaFormProps) {
  const [areaType, setAreaType] = useState<'city' | 'county' | 'region' | 'zip'>(
    (initialData?.areaType as any) || 'city'
  );
  const [city, setCity] = useState(initialData?.city || '');
  const [county, setCounty] = useState(initialData?.county || '');
  const [state, setState] = useState(initialData?.state || 'FL');
  const [region, setRegion] = useState(initialData?.region || '');
  const [zipCode, setZipCode] = useState(initialData?.zipCode || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const areaData: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'> = {
      vendorId,
      areaType,
      city: areaType === 'city' ? city : undefined,
      county: areaType === 'county' ? county : undefined,
      state: areaType === 'city' || areaType === 'county' ? state : undefined,
      region: areaType === 'region' ? region : undefined,
      zipCode: areaType === 'zip' ? zipCode : undefined,
      displayOrder: initialData?.displayOrder || 0,
    };

    onSubmit(areaData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Service Area' : 'Add Service Area'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Area Type</label>
            <select
              value={areaType}
              onChange={(e) => setAreaType(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
            >
              <option value="city">City</option>
              <option value="county">County</option>
              <option value="region">Region</option>
              <option value="zip">ZIP Code</option>
            </select>
          </div>

          {areaType === 'city' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Orlando"
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., FL"
                  maxLength={2}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
            </>
          )}

          {areaType === 'county' && (
            <>
              <div>
                <label className="block text-gray-400 text-sm mb-2">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="e.g., Orange"
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., FL"
                  maxLength={2}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>
            </>
          )}

          {areaType === 'region' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Region</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., Central Florida"
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
          )}

          {areaType === 'zip' && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g., 32801"
                maxLength={5}
                className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-500"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition"
            >
              {initialData ? 'Update' : 'Add'} Area
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
