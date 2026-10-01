import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function LocationPreview({ latitude, longitude, address }: LocationPreviewProps) {
  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009,
  };

  return (
    <View className="space-y-2.5">
      <View className="flex-row items-center gap-1.5">
        <MapPin size={14} color="#10B981" />
        <Text className="text-xs font-medium text-slate-700">Titik Lokasi Kejadian</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            pinColor="#10B981"
            title={address || 'Lokasi Kejadian'}
          />
        </MapView>
      </View>

      {address ? (
        <View className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1">
          <Text className="text-[11px] font-medium text-slate-700">Alamat Kejadian:</Text>
          <Text className="text-[11px] text-slate-500 font-normal leading-relaxed">{address}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 180,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
