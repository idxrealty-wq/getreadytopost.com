// src/components/maps/AgentMapShell.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AgentMapProfile, MapFiltersState, DEFAULT_FILTERS, PropertyPin } from "@/lib/maps/mapTypes";
import MapFilters from "./MapFilters";
import PropertyPinCard from "./PropertyPinCard";

interface AgentMapShellProps {
  profile: AgentMapProfile;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#16a34a",
  sold: "#dc2626",
  pending: "#d97706",
};

declare global {
  interface Window {
    google: typeof google;
    initGRTPMap: () => void;
  }
}

export default function AgentMapShell({ profile }: AgentMapShellProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [filters, setFilters] = useState<MapFiltersState>(DEFAULT_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<PropertyPin | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const filteredProperties = profile.properties.filter((p) => {
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (p.listPrice < filters.minPrice) return false;
    if (p.listPrice > filters.maxPrice) return false;
    if (p.bedrooms < filters.minBeds) return false;
    if (p.bathrooms < filters.minBaths) return false;
    if (filters.showVideosOnly && !p.videoUrl) return false;
    return true;
  });

  const initMap = useCallback(() => {
    if (!mapRef.current) return;

    const center = { lat: 28.5383, lng: -81.4800 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 10,
      mapTypeId: "roadmap",
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    mapInstanceRef.current = map;
    setMapReady(true);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initGRTPMap = initMap;

    const existing = document.getElementById("grtp-maps-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "grtp-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initGRTPMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [initMap]);

  // Render markers when map is ready or filters change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredProperties.forEach((property) => {
      const marker = new window.google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: mapInstanceRef.current!,
        title: property.address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: STATUS_COLORS[property.status],
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        setSelectedProperty(property);
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, filteredProperties]);

  return (
    <div className="flex flex-col h-full">

      {/* Agent Header */}
      <div className="bg-[#0a2342] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {profile.agentPhotoUrl ? (
            <img
              src={profile.agentPhotoUrl}
              alt={profile.agentName}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#c8a84b]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#c8a84b] flex items-center justify-center text-[#0a2342] font-bold text-lg">
              {profile.agentName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-base leading-tight">{profile.agentName}</p>
            <p className="text-xs text-gray-300">{profile.brokerageName}</p>
            <p className="text-xs text-gray-400">{profile.serviceArea}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-300">{profile.agentPhone}</p>
          <p className="text-xs text-gray-400">{profile.agentEmail}</p>
          <p className="text-xs text-gray-500 mt-1">Lic# {profile.licenseNumber}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-[#f8f9fa] border-b border-gray-200 px-6 py-2 flex items-center gap-6 flex-shrink-0">
        {[
          { status: "active", color: "#16a34a", label: "Active" },
          { status: "pending", color: "#d97706", label: "Pending" },
          { status: "sold", color: "#dc2626", label: "Sold" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block border-2 border-white shadow"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 font-medium">{item.label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          Powered by GetReadyToPost.com
        </span>
      </div>

      {/* Filters */}
      <MapFilters
        filters={filters}
        onChange={setFilters}
        totalCount={profile.properties.length}
        filteredCount={filteredProperties.length}
      />

      {/* Map Container */}
      <div className="relative flex-1 min-h-0">
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading state */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[#0a2342] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {/* Property Card Overlay */}
        {selectedProperty && (
          <div className="absolute top-4 right-4 z-10">
            <PropertyPinCard
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
