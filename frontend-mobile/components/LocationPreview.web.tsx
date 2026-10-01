import React from 'react';
import { View, Text, Image, Linking, Pressable } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function LocationPreview({ latitude, longitude, address }: LocationPreviewProps) {
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=15&size=600x180&markers=${latitude},${longitude},lightgreen1`;

  const openMap = () => {
    Linking.openURL(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`);
  };

  return (
    <View className="mt-4 gap-2">
      <View className="flex-row items-center gap-1.5">
        <MapPin size={16} color="#6FCF97" />
        <Text className="text-sm font-semibold text-ink">Lokasi Kejadian di Peta</Text>
      </View>

      <Pressable onPress={openMap} className="overflow-hidden rounded-[20px] border border-stone-200">
        <Image
          source={{ uri: mapUrl }}
          style={{ width: '100%', height: 180 }}
          resizeMode="cover"
        />
      </Pressable>

      <Text className="text-[11px] text-inkMuted">
        Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>

      {address ? (
        <View className="rounded-2xl border border-stone-200 bg-stone-50/50 p-3">
          <Text className="text-xs font-bold text-ink">Alamat Kejadian:</Text>
          <Text className="text-[12px] text-inkMuted leading-[17px] mt-0.5">{address}</Text>
        </View>
      ) : null}
    </View>
  );
}
