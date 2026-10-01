import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet marker icon issue in Vite build
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapPreview({ latitude, longitude, address }) {
  if (!latitude || !longitude) return null;

  const position = [latitude, longitude];

  return (
    <div className="space-y-2 mt-4">
      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <MapPin size={14} className="text-[#6FCF97]" />
        Lokasi Kejadian di Peta
      </span>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm h-[220px] w-full z-0">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={customIcon}>
            {address && (
              <Popup>
                <div className="text-xs font-medium text-slate-800">{address}</div>
              </Popup>
            )}
          </Marker>
        </MapContainer>
      </div>

      {address && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600">
          <span className="font-bold text-slate-700 block mb-0.5">Alamat Laporan:</span>
          {address}
        </div>
      )}
    </div>
  );
}
