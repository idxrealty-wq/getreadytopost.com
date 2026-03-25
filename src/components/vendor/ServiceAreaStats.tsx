'use client';

import { ServiceArea } from '@/types/service-areas';
import { MapPin, Building2, Globe, Hash } from 'lucide-react';

interface ServiceAreaStatsProps {
  areas: ServiceArea[];
}

export default function ServiceAreaStats({ areas }: ServiceAreaStatsProps) {
  const cityCount = areas.filter((a) => a.areaType === 'city').length;
  const countyCount = areas.filter((a) => a.areaType === 'county').length;
  const regionCount = areas.filter((a) => a.areaType === 'region').length;
  const zipCount = areas.filter((a) => a.areaType === 'zip').length;

  const stats = [
    {
      label: 'Cities',
      value: cityCount,
      icon: MapPin,
      color: 'text-blue-400',
    },
    {
      label: 'Counties',
      value: countyCount,
      icon: Building2,
      color: 'text-green-400',
    },
    {
      label: 'Regions',
      value: regionCount,
      icon: Globe,
      color: 'text-purple-400',
    },
    {
      label: 'ZIP Codes',
      value: zipCount,
      icon: Hash,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={stat.color} size={20} />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
