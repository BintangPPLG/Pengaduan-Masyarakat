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
        alert('Izin lokasi ditolak. Izinkan akses lokasi di browser.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await applyCoords(loc.coords.latitude, loc.coords.longitude);
    } catch {
      alert('Gagal mengambil lokasi GPS.');
    } finally {
      setGpsLoading(false);
    }
  };

  const applyManual = () => {
    const lat = parseFloat(latText);
    const lng = parseFloat(lngText);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      alert('Koordinat tidak valid.');
      return;
    }
    applyCoords(lat, lng);
  };

  return (
    <View className="mt-3 gap-2.5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <MapPin size={16} color="#6FCF97" />
          <Text className="text-sm font-semibold text-ink">Pilih Lokasi Kejadian</Text>
        </View>
        <Pressable
          onPress={requestGPS}
          disabled={gpsLoading}
          className="flex-row items-center gap-1.5 rounded-full bg-cream-100 border border-peach-300 px-3.5 py-1.5 active:opacity-75 disabled:opacity-50"
        >
          <Navigation size={12} color="#56B97E" />
          <Text className="text-[11px] font-bold text-peach-600">
            {gpsLoading ? 'Mendapatkan lokasi...' : 'GPS Saya'}
          </Text>
        </Pressable>
      </View>

      <Text className="text-[12px] text-inkMuted">
        Di browser, gunakan GPS atau masukkan koordinat secara manual.
      </Text>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold text-ink">Latitude</Text>
          <TextInput
            className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-ink"
            value={latText}
            onChangeText={setLatText}
            placeholder="-6.200000"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold text-ink">Longitude</Text>
          <TextInput
            className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-ink"
            value={lngText}
            onChangeText={setLngText}
            placeholder="106.816600"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Pressable
        onPress={applyManual}
        className="self-start rounded-2xl bg-cream-200 px-4 py-2.5"
      >
        <Text className="text-sm font-bold text-ink">Terapkan Koordinat</Text>
      </Pressable>

      {address ? (
        <View className="rounded-2xl border border-stone-200 bg-white p-3.5 gap-1.5">
          <Text className="text-xs font-bold text-ink">Alamat:</Text>
          {loadingAddress ? (
            <ActivityIndicator size="small" color="#56B97E" />
          ) : (
            <Text className="text-[12px] text-inkMuted leading-[17px]">{address}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
