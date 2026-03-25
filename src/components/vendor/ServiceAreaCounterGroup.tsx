'use client';

import { ServiceArea } from '@/types/service-areas';
import { Plus } from 'lucide-react';
import ServiceAreaCard from './ServiceAreaCard';

interface ServiceAreaCounterGroupProps {
  areas: ServiceArea[];
  onAdd: () => void;
  onEdit: (area: ServiceArea) => void;
  onDelete: (areaId: string) => void;
  isLoading?: boolean;
}

export default function ServiceAreaCounterGroup({
  areas,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: ServiceAreaCounterGroupProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Service Areas</h3>
          <p className="text-gray-400 text-sm">
            {areas.length} {areas.length === 1 ? 'area' : 'areas'} configured
          </p>
        </div>

        <button
          onClick={onAdd}
          disabled={isLoading}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold py-2 px-4 rounded-lg transition"
        >
          <Plus size={18} />
          Add Area
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No service areas added yet.</p>
          <p className="text-gray-500 text-sm">
            Add at least one service area to enable vendor visibility.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map((area) => (
            <ServiceAreaCard
              key={area.id}
              area={area}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
