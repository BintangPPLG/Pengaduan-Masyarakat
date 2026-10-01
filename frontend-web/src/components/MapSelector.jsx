import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

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

// Custom pin icon using primary color #6FCF97 theme
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center: Jakarta, Indonesia
const DEFAULT_CENTER = [-6.2000, 106.8166];

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function MapSelector({ onLocationSelected, initialLat, initialLng }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      const lat = parseFloat(initialLat);
      const lng = parseFloat(initialLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const initPos = [lat, lng];
        setPosition(initPos);
        setMapCenter(initPos);
        fetchAddress(lat, lng);
      }
    }
  }, [initialLat, initialLng]);

  const fetchAddress = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
          },
        }
      );
      const data = await response.json();
      const displayName = data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(displayName);
      onLocationSelected({ latitude: lat, longitude: lng, address: displayName });
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      const coordsName = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(coordsName);
      onLocationSelected({ latitude: lat, longitude: lng, address: coordsName });
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setPosition([lat, lng]);
    setMapCenter([lat, lng]);
    fetchAddress(lat, lng);
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung Geolocation.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        fetchAddress(latitude, longitude);
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        alert('Gagal mengambil lokasi GPS. Pastikan izin lokasi aktif.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <MapPin size={14} className="text-[#6FCF97]" />
          Pilih Lokasi Kejadian
        </span>
        <button
          type="button"
          onClick={handleGetGPS}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#6FCF97]/30 bg-[#F0FBF5] px-3.5 py-1.5 text-xs font-bold text-[#56B97E] hover:bg-[#C3F1D7]/30 transition active:scale-95 disabled:opacity-50"
        >
          <Navigation size={13} className={gpsLoading ? 'animate-spin' : ''} />
          {gpsLoading ? 'Mendapatkan lokasi...' : 'Gunakan Lokasi GPS Saya'}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner h-[280px] w-full z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} icon={customIcon} />}
          <MapClickHandler onClick={handleMapClick} />
          <ChangeView center={mapCenter} />
        </MapContainer>
      </div>

      {position && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs space-y-1.5 transition duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Koordinat terpilih:</span>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[#56B97E] font-medium">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </code>
          </div>
          <div className="text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-700 block mb-0.5">Alamat:</span>
            {loadingAddress ? (
              <span className="text-slate-400 animate-pulse">Mencari alamat...</span>
            ) : (
              address
            )}
          </div>
        </div>
      )}
    </div>
  );
}
