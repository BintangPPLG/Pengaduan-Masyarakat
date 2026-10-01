import { fetchCategories } from '@/lib/api/categoriesApi';
import { createReport } from '@/lib/api/reportsApi';
import type { Category } from '@/lib/api/types';
import { useProtectedUser } from '@/hooks/use-protected-user';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationSelector from '@/components/LocationSelector';
import {
  ArrowLeft,
  Camera,
  Send,
  X,
  Tag,
  FileText,
  AlertCircle,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react-native';

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export default function NewReportScreen() {
  useProtectedUser();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadCat, setLoadCat] = useState(true);

  // Mobile Map States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        if (list.length) setCategoryId(String(list[0].id));
      } catch (err: unknown) {
        if (!cancelled) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          setError(e.response?.data?.message || e.message || 'Gagal memuat kategori.');
        }
      } finally {
        if (!cancelled) setLoadCat(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLocationSelected = (loc: { latitude: number; longitude: number; address: string }) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setAddress(loc.address);
  };

  const pickFromLibrary = async () => {
    if (pickedImages.length >= MAX_IMAGES) {
      Alert.alert('Batas foto', `Maksimal ${MAX_IMAGES} foto.`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Izin diperlukan',
        'Izinkan akses galeri agar bisa melampirkan foto (JPG, PNG, atau GIF).'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - pickedImages.length,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;

    // Validasi ukuran: maks 5 MB per foto
    const oversized = result.assets.filter(
      (a) => a.fileSize != null && a.fileSize > MAX_FILE_BYTES
    );
    if (oversized.length > 0) {
      const names = oversized
        .map((a) => {
          const mb = ((a.fileSize ?? 0) / 1024 / 1024).toFixed(1);
          return `• ${a.fileName || 'foto'} (${mb} MB)`;
        })
        .join('\n');
      Alert.alert(
        'Foto terlalu besar',
        `Foto berikut melebihi batas 5 MB dan tidak disertakan:\n\n${names}\n\nGunakan foto dengan ukuran ≤ 5 MB.`
      );
    }

    const valid = result.assets.filter(
      (a) => a.fileSize == null || a.fileSize <= MAX_FILE_BYTES
    );
    if (valid.length === 0) return;

    setPickedImages((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, MAX_IMAGES);
    });
  };

  const removeImage = (index: number) => {
    setPickedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('header', header);

      // Append coordinates metadata block to report body if location selected
      const finalBody = latitude && longitude
        ? `${body.trim()}\n\n---\n📍 Koordinat: ${latitude}, ${longitude}\n🗺️ Alamat: ${address || 'Lokasi terpilih'}`
        : body;

      formData.append('body', finalBody);
      formData.append('category_id', categoryId);

      pickedImages.forEach((img) => {
        const name =
          img.fileName ||
          img.uri.split('/').pop() ||
          `laporan-${Date.now()}.jpg`;
        const type = img.mimeType || mimeFromName(name);
        formData.append('images', {
          uri: img.uri,
          name,
          type,
        } as unknown as Blob);
      });

      const data = await createReport(formData);
      router.replace(`/laporan/${data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const payload = e.response?.data as { message?: string; error?: string } | undefined;
      setError(
        payload?.message || payload?.error || e.message || 'Gagal mengirim laporan.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadCat) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 bg-[#F8FAFC]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-xs font-medium text-slate-500">Memuat kategori...</Text>
      </View>
    );
  }

  const canSubmit = !loading && header.trim().length > 0 && body.trim().length > 0;

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAFC]"
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 36,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center gap-1.5 self-start py-1"
      >
        <ArrowLeft size={14} color="#64748B" />
        <Text className="text-xs font-medium text-slate-500">Daftar Laporan</Text>
      </Pressable>

      {/* Header card */}
      <View className="mb-4 rounded-[28px] border border-slate-200/90 bg-white/95 p-5 shadow-xs space-y-2">
        <View className="flex-row items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5">
          <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <Text className="text-[10px] font-medium text-emerald-800">
            Formulir Aspirasi
          </Text>
        </View>

        <Text className="text-xl font-semibold tracking-tight text-slate-900">
          Buat Laporan Baru
        </Text>

        {user ? (
          <View className="flex-row items-center gap-1.5">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
              <Text className="text-[10px] font-medium text-white">
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xs font-medium text-slate-700">{user.username}</Text>
            <Text className="text-xs text-slate-400 font-normal">· Pengguna Warga</Text>
          </View>
        ) : null}

        <Text className="text-xs leading-relaxed text-slate-500 font-normal">
          Isi formulir dengan detail lokasi dan kronologi yang jelas agar petugas dapat menindaklanjuti secara tepat.
        </Text>
      </View>

      {/* Error banner */}
      {error ? (
        <View className="mb-4 flex-row items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <AlertCircle size={14} color="#E11D48" className="mt-0.5" />
          <Text className="flex-1 text-xs font-medium text-rose-800 leading-tight">{error}</Text>
        </View>
      ) : null}

      {categories.length === 0 ? (
        <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-xs leading-relaxed text-amber-900 font-normal">
            Belum ada kategori yang tersedia di sistem. Hubungi administrator portal web.
          </Text>
        </View>
      ) : (
        <View className="space-y-3.5">
          {/* Judul Laporan */}
          <View className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs space-y-1.5">
            <Text className="text-xs font-medium text-slate-700">Judul Pengaduan</Text>
            <TextInput
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 font-normal"
              value={header}
              onChangeText={setHeader}
              placeholder="Contoh: Lampu penerangan jalan padam di Jl. Merdeka"
              placeholderTextColor="#94A3B8"
              maxLength={255}
            />
          </View>

          {/* Isi Laporan */}
          <View className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs space-y-1.5">
            <Text className="text-xs font-medium text-slate-700">Kronologi & Uraian Lengkap</Text>
            <TextInput
              className="min-h-[110px] rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 font-normal leading-relaxed"
              value={body}
              onChangeText={setBody}
              placeholder="Jelaskan detail: patokan jalan, estimasi durasi kendala, dampak bagi warga sekitar..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Kategori */}
          <View className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs space-y-2">
            <View className="flex-row items-center gap-1.5">
              <Tag size={13} color="#10B981" />
              <Text className="text-xs font-medium text-slate-700">Pilih Kategori</Text>
            </View>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {categories.map((c) => {
                const active = categoryId === String(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(String(c.id))}
                    className={`rounded-full px-3.5 py-1.5 ${
                      active
                        ? 'border border-emerald-500 bg-emerald-50'
                        : 'border border-slate-200 bg-white active:bg-slate-50'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        active ? 'font-medium text-emerald-800' : 'font-normal text-slate-600'
                      }`}
                    >
                      {c.category_name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Lokasi Peta & GPS */}
          <View className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs">
            <LocationSelector onLocationSelected={handleLocationSelected} />
          </View>

          {/* Foto Bukti */}
          <View className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xs space-y-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <ImageIcon size={13} color="#10B981" />
                <Text className="text-xs font-medium text-slate-700">Foto Bukti Lampiran</Text>
              </View>
              <Text className="text-[11px] text-slate-400 font-normal">
                {pickedImages.length}/{MAX_IMAGES} foto
              </Text>
            </View>

            {/* Thumbnail preview */}
            {pickedImages.length > 0 && (
              <View className="flex-row flex-wrap gap-2 pt-1">
                {pickedImages.map((img, idx) => (
                  <View key={idx} className="relative">
                    <Image
                      source={{ uri: img.uri }}
                      className="h-20 w-20 rounded-xl bg-slate-100 border border-slate-200"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={() => removeImage(idx)}
                      className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-rose-600 shadow-xs"
                    >
                      <X size={11} color="#ffffff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {pickedImages.length < MAX_IMAGES ? (
              <Pressable
                onPress={pickFromLibrary}
                className="mt-1 flex-row items-center gap-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-3 active:bg-slate-100"
              >
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                  <Camera size={16} color="#059669" />
                </View>
                <View>
                  <Text className="text-xs font-medium text-slate-800">
                    {pickedImages.length === 0 ? 'Lampirkan Foto Bukti' : 'Tambah Foto Lain'}
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-normal">
                    Format JPG, PNG, GIF (Maks. 5 MB/foto)
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <Text className="text-xs font-medium text-emerald-800">
                  ✓ Kapasitas {MAX_IMAGES} foto lampiran telah terpenuhi
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 shadow-xs active:bg-emerald-700 ${
              !canSubmit ? 'opacity-50' : ''
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Send size={14} color="#ffffff" />
                <Text className="text-xs font-medium text-white">Kirim Laporan Pengaduan</Text>
              </>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
