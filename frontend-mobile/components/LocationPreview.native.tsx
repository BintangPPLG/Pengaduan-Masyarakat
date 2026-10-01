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
    <View className="mt-4 gap-2">
      <View className="flex-row items-center gap-1.5">
        <MapPin size={16} color="#6FCF97" />
        <Text className="text-sm font-semibold text-ink">Lokasi Kejadian di Peta</Text>
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
            pinColor="#6FCF97"
            title={address || 'Lokasi Kejadian'}
          />
        </MapView>
      </View>

      {address ? (
        <View className="rounded-2xl border border-stone-200 bg-stone-50/50 p-3">
          <Text className="text-xs font-bold text-ink">Alamat Kejadian:</Text>
          <Text className="text-[12px] text-inkMuted leading-[17px] mt-0.5">{address}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 180,
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
