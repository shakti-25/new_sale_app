import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { VisitRecord } from '../types';

interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: VisitRecord[];
  interactivePin?: {
    lat: number;
    lng: number;
    label?: string;
    onPinChange?: (lat: number, lng: number) => void;
  };
  className?: string;
  onSelectVisit?: (visit: VisitRecord) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  interactivePin,
  className = 'h-72 w-full',
  onSelectVisit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);
      markerLayerRef.current = markerLayer;
      mapRef.current = map;

      // Click to place/move pin if interactive
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (interactivePin?.onPinChange) {
          interactivePin.onPinChange(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync center & zoom
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();

    // 1. Render Interactive Pin if provided
    if (interactivePin) {
      const liveIcon = L.divIcon({
        className: 'custom-live-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; background: rgba(59, 130, 246, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 24px; height: 24px; background: #2563eb; border: 3px solid #ffffff; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 9999px;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const pinMarker = L.marker([interactivePin.lat, interactivePin.lng], {
        icon: liveIcon,
        draggable: !!interactivePin.onPinChange,
      });

      if (interactivePin.label) {
        pinMarker.bindPopup(`<b>${interactivePin.label}</b><br/>Drag pin or click map to reposition.`);
      }

      if (interactivePin.onPinChange) {
        pinMarker.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          interactivePin.onPinChange!(latlng.lat, latlng.lng);
        });
      }

      pinMarker.addTo(markerLayerRef.current);
    }

    // 2. Render List of Visit Records
    if (markers.length > 0) {
      const bounds = L.latLngBounds([]);

      markers.forEach((v) => {
        if (!v.location || !v.location.latitude || !v.location.longitude) return;

        bounds.extend([v.location.latitude, v.location.longitude]);

        const isPhysical = v.meetingType === 'Physical';
        const color = isPhysical ? '#10b981' : '#3b82f6';

        const recordIcon = L.divIcon({
          className: 'custom-record-pin',
          html: `
            <div style="background: ${color}; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px; font-family: monospace; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: white;"></span>
              ${v.serialNo}
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 24],
        });

        const marker = L.marker([v.location.latitude, v.location.longitude], {
          icon: recordIcon,
        });

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 200px; color: #0f172a;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 2px; color: #1e293b;">${v.clientName}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              <b>${v.serialNo}</b> • ${v.date} • Rep: <b>${v.salespersonName}</b>
            </div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 6px;">
              <div><b>Type:</b> ${v.meetingType} Meet</div>
              <div><b>Lumpsum:</b> ₹${Number(v.businessLumpsum || 0).toLocaleString('en-IN')}</div>
              <div><b>SIP:</b> ₹${Number(v.businessSip || 0).toLocaleString('en-IN')}/mo</div>
            </div>
            <div style="color: #334155; font-size: 11px; line-height: 1.3;">
              📍 ${v.location.locationName || v.location.formattedAddress}
            </div>
            <div style="margin-top: 8px; display: flex; gap: 6px;">
              <a href="https://www.google.com/maps?q=${v.location.latitude},${v.location.longitude}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #2563eb; color: white; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold;">
                Open Google Maps
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectVisit) {
          marker.on('click', () => onSelectVisit(v));
        }

        marker.addTo(markerLayerRef.current!);
      });

      // Fit bounds if more than 1 marker and no interactivePin
      if (markers.length > 1 && !interactivePin && bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [markers, interactivePin]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`}>
      <div ref={containerRef} className="h-full w-full z-0" />
    </div>
  );
};
