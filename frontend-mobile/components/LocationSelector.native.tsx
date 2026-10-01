import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Navigation } from 'lucide-react-native';

interface LocationSelectorProps {
  onLocationSelected: (location: { latitude: number; longitude: number; address: string }) => void;
}

const DEFAULT_LATITUDE = -6.2;
const DEFAULT_LONGITUDE = 106.8166;

export default function LocationSelector({ onLocationSelected }: LocationSelectorProps) {
  const [region, setRegion] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchAddress = async (lat: number, lng: number) => {
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

  const handleMapPress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setPosition(coords);
    fetchAddress(coords.latitude, coords.longitude);
  };

  const handleMarkerDragEnd = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const coords = e.nativeEvent.coordinate;
    setPosition(coords);
    fetchAddress(coords.latitude, coords.longitude);
  };

  const requestGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Izin lokasi ditolak. Harap izinkan akses GPS di pengaturan handphone.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setPosition(coords);
      setRegion({ ...coords, latitudeDelta: 0.009, longitudeDelta: 0.009 });
      fetchAddress(coords.latitude, coords.longitude);
    } catch {
      alert('Gagal mengambil lokasi GPS. Coba lagi atau tap peta secara manual.');
    } finally {
      setGpsLoading(false);
    }
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

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(r) => setRegion(r)}
          onPress={handleMapPress}
        >
          {position && (
            <Marker
              coordinate={position}
              draggable
              onDragEnd={handleMarkerDragEnd}
              pinColor="#6FCF97"
            />
          )}
        </MapView>
      </View>

      {position && (
        <View className="rounded-2xl border border-stone-200 bg-white p-3.5 gap-1.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-ink">Koordinat:</Text>
            <Text className="font-mono text-xs font-semibold text-peach-600">
              {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-bold text-ink">Alamat:</Text>
            {loadingAddress ? (
              <ActivityIndicator size="small" color="#56B97E" className="self-start mt-0.5" />
            ) : (
              <Text className="text-[12px] text-inkMuted leading-[17px] mt-0.5">{address}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 220,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
