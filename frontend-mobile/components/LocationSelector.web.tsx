import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation } from 'lucide-react-native';

interface LocationSelectorProps {
  onLocationSelected: (location: { latitude: number; longitude: number; address: string }) => void;
}

export default function LocationSelector({ onLocationSelected }: LocationSelectorProps) {
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const applyCoords = async (lat: number, lng: number) => {
    setLatText(String(lat));
    setLngText(String(lng));
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            'User-Agent': 'AAS-Mobile-App/1.0',
          },
        }
      );
      const data = await response.json();
      const displayName = data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(displayName);
      onLocationSelected({ latitude: lat, longitude: lng, address: displayName });
    } catch {
      const fallback = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallback);
      onLocationSelected({ latitude: lat, longitude: lng, address: fallback });
    } finally {
      setLoadingAddress(false);
    }
  };

  const requestGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin lokasi ditolak. Harap izinkan akses lokasi pada browser Anda.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await applyCoords(loc.coords.latitude, loc.coords.longitude);
    } catch {
      alert('Gagal mendeteksi lokasi GPS.');
    } finally {
      setGpsLoading(false);
    }
  };

  const applyManual = () => {
    const lat = parseFloat(latText);
    const lng = parseFloat(lngText);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert('Format angka koordinat tidak valid.');
      return;
    }
    applyCoords(lat, lng);
  };

  return (
    <View className="space-y-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MapPin size={14} color="#10B981" />
          <Text className="text-xs font-medium text-slate-700">Pilih Lokasi Kejadian</Text>
        </View>
        <Pressable
          onPress={requestGPS}
          disabled={gpsLoading}
          className="flex-row items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 active:bg-emerald-100 disabled:opacity-50"
        >
          <Navigation size={11} color="#059669" />
          <Text className="text-[10px] font-medium text-emerald-800">
            {gpsLoading ? 'Mencari...' : 'Gunakan GPS'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-[11px] text-slate-400 font-normal">
        Gunakan tombol GPS atau masukkan koordinat manual di bawah ini.
      </Text>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Text className="mb-1 text-[11px] font-medium text-slate-600">Latitude</Text>
          <TextInput
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 font-normal"
            value={latText}
            onChangeText={setLatText}
            placeholder="-6.200000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-[11px] font-medium text-slate-600">Longitude</Text>
          <TextInput
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 font-normal"
            value={lngText}
            onChangeText={setLngText}
            placeholder="106.816600"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Pressable
        onPress={applyManual}
        className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 active:bg-slate-50"
      >
        <Text className="text-xs font-medium text-slate-700">Terapkan Koordinat</Text>
      </Pressable>

      {address ? (
        <View className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1">
          <Text className="text-[11px] font-medium text-slate-700">Alamat Terdeteksi:</Text>
          {loadingAddress ? (
            <ActivityIndicator size="small" color="#10B981" className="self-start mt-0.5" />
          ) : (
            <Text className="text-[11px] text-slate-500 font-normal leading-relaxed">{address}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
