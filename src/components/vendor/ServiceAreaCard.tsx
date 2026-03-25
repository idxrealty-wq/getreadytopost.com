'use client';

import { ServiceArea } from '@/types/service-areas';
import { Trash2, Edit2 } from 'lucide-react';

interface ServiceAreaCardProps {
  area: ServiceArea;
  onEdit: (area: ServiceArea) => void;
  onDelete: (areaId: string) => void;
}

export default function ServiceAreaCard({
  area,
  onEdit,
  onDelete,
}: ServiceAreaCardProps) {
  const getAreaLabel = () => {
    switch (area.areaType) {
      case 'city':
        return `${area.city}, ${area.state}`;
      case 'county':
        return `${area.county} County, ${area.state}`;
      case 'region':
        return area.region;
      case 'zip':
        return `ZIP: ${area.zipCode}`;
      default:
        return 'Unknown Area';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-gray-600 transition">
      <div className="flex-1">
        <p className="text-white font-semibold">{getAreaLabel()}</p>
        <p className="text-gray-400 text-sm capitalize">{area.areaType}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(area)}
          className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-gray-700 rounded transition"
          title="Edit"
        >
          <Edit2 size={18} />
        </button>

        <button
          onClick={() => onDelete(area.id)}
          className="p-2 text-red-500 hover:text-red-400 hover:bg-gray-700 rounded transition"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
