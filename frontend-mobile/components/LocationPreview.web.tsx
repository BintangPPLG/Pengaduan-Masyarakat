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
    <View className="space-y-2.5">
      <View className="flex-row items-center gap-1.5">
        <MapPin size={14} color="#10B981" />
        <Text className="text-xs font-medium text-slate-700">Titik Lokasi Kejadian</Text>
      </View>

      <Pressable onPress={openMap} className="overflow-hidden rounded-2xl border border-slate-200">
        <Image
          source={{ uri: mapUrl }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
      </Pressable>

      <Text className="text-[11px] text-slate-400 font-mono">
        Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>

      {address ? (
        <View className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1">
          <Text className="text-[11px] font-medium text-slate-700">Alamat Kejadian:</Text>
          <Text className="text-[11px] text-slate-500 font-normal leading-relaxed">{address}</Text>
        </View>
      ) : null}
    </View>
  );
}
