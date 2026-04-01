// src/components/maps/PropertyPinCard.tsx
"use client";

import { PropertyPin } from "@/lib/maps/mapTypes";

interface PropertyPinCardProps {
  property: PropertyPin;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border border-green-300",
  sold: "bg-red-100 text-red-800 border border-red-300",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  pending: "Pending",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyPinCard({ property, onClose }: PropertyPinCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0a2342] px-4 py-3 flex items-center justify-between">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[property.status]}`}
        >
          {STATUS_LABELS[property.status]}
        </span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 text-lg font-bold leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Photo placeholder */}
      {property.photoUrl ? (
        <img
          src={property.photoUrl}
          alt={property.address}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Photo Available</span>
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="font-semibold text-gray-900 text-sm leading-tight">
          {property.address}
        </p>
        <p className="text-gray-500 text-xs">
          {property.city}, {property.state} {property.zip}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-[#0a2342] font-bold text-base">
            {formatPrice(property.listPrice)}
          </span>
          {property.soldPrice && (
            <span className="text-xs text-gray-400 line-through">
              Sold: {formatPrice(property.soldPrice)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-600">
          <span>{property.bedrooms} bd</span>
          <span>{property.bathrooms} ba</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>

        {/* MLS */}
        <p className="text-xs text-gray-400">MLS# {property.mlsNumber}</p>

        {/* Description */}
        {property.description && (
          <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
            {property.description}
          </p>
        )}

        {/* Video link */}
        {property.videoUrl && (
          <a
            href={property.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs font-semibold text-white bg-[#c8a84b] hover:bg-[#b8973a] rounded-lg py-2 mt-2 transition-colors"
          >
            ▶ Watch Video Walkthrough
          </a>
        )}
      </div>
    </div>
  );
}
