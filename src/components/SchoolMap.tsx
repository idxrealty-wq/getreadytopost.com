"use client";
import { useEffect, useRef } from "react";

interface School {
  name: string;
  rating: string;
  grades: string;
  type: string;
  distance: number;
  lat: string;
  lng: string;
}

interface SchoolMapProps {
  propertyLat: string;
  propertyLng: string;
  schools: School[];
}

export default function SchoolMap({ propertyLat, propertyLng, schools }: SchoolMapProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!propertyLat || !propertyLng) return;
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView(
        [parseFloat(propertyLat), parseFloat(propertyLng)],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Property pin (gold)
      const propertyIcon = L.divIcon({
        html: `<div style="background:#c9a227;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([parseFloat(propertyLat), parseFloat(propertyLng)], { icon: propertyIcon })
        .addTo(map)
        .bindPopup("<b>📍 Subject Property</b>")
        .openPopup();

      // School pins
      const validSchools = schools.filter(
        (s) => s.lat && s.lng && !s.name.toLowerCase().includes("virtual")
      );

      validSchools.forEach((school) => {
        const ratingColor =
          school.rating?.startsWith("A") ? "#22c55e" :
          school.rating?.startsWith("B") ? "#3b82f6" :
          school.rating?.startsWith("C") ? "#f59e0b" :
          school.rating?.startsWith("D") ? "#ef4444" : "#6b7280";

        const schoolIcon = L.divIcon({
          html: `<div style="background:${ratingColor};color:white;font-size:10px;font-weight:bold;padding:3px 6px;border-radius:6px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);white-space:nowrap;">🏫 ${school.rating || '?'}</div>`,
          className: "",
          iconSize: [50, 24],
          iconAnchor: [25, 12],
        });

        L.marker([parseFloat(school.lat), parseFloat(school.lng)], { icon: schoolIcon })
          .addTo(map)
          .bindPopup(
            `<b>${school.name}</b><br/>
             Grades: ${school.grades}<br/>
             Type: ${school.type}<br/>
             Rating: <b style="color:${ratingColor}">${school.rating || 'N/A'}</b><br/>
             Distance: ${school.distance} mi`
          );
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [propertyLat, propertyLng, schools]);

  if (!propertyLat || !propertyLng) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-gray-300">🗺️ School Map</span>
        <span className="text-xs text-gray-500">Powered by OpenStreetMap — free, no API key</span>
      </div>
      <div className="flex gap-3 mb-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span style={{background:"#c9a227",width:10,height:10,borderRadius:"50%",display:"inline-block"}}></span> Property
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span style={{background:"#22c55e",width:10,height:10,borderRadius:3,display:"inline-block"}}></span> A-rated
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span style={{background:"#3b82f6",width:10,height:10,borderRadius:3,display:"inline-block"}}></span> B-rated
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span style={{background:"#f59e0b",width:10,height:10,borderRadius:3,display:"inline-block"}}></span> C-rated
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span style={{background:"#ef4444",width:10,height:10,borderRadius:3,display:"inline-block"}}></span> D-rated
        </span>
      </div>
      <div
        ref={mapRef}
        style={{ height: "350px", width: "100%", borderRadius: "12px", overflow: "hidden" }}
      />
    </div>
  );
}
