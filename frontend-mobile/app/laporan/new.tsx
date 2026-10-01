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
        '📛 Foto terlalu besar',
        `Foto berikut melebihi batas 5 MB dan tidak akan ditambahkan:\n\n${names}\n\nGunakan foto dengan ukuran ≤ 5 MB.`
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
        className="flex-1 items-center justify-center gap-3 bg-cream-100"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#6FCF97" />
        <Text className="text-sm text-inkMuted">Memuat kategori...</Text>
      </View>
    );
  }

  const canSubmit = !loading && header.trim().length > 0 && body.trim().length > 0;

  return (
    <ScrollView
      className="flex-1 bg-cream-100"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 40,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ─── Header card ─────────────────────────────────────────── */}
      <View className="mb-4 rounded-3xl border border-white/90 bg-white/95 p-5 shadow-clay-sm">
        <Text className="self-start rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-extrabold text-ink">
          Form Laporan
        </Text>
        <Text className="mt-2 text-2xl font-extrabold text-ink">Tambah Laporan</Text>
        {user ? (
          <View className="mt-2 flex-row items-center gap-1.5">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-peach-500">
              <Text className="text-[11px] font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-ink">{user.username}</Text>
            <Text className="text-[13px] text-inkMuted">· {user.role}</Text>
          </View>
        ) : null}
        <Text className="mt-2 text-[13px] leading-[19px] text-inkMuted">
          Isi semua kolom dengan jelas dan spesifik. Foto bersifat opsional (maks. {MAX_IMAGES} foto, maks. 5 MB/foto).
        </Text>
      </View>

      {/* ─── Error banner ────────────────────────────────────────── */}
      {error ? (
        <View className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3.5">
          <Text className="text-sm font-semibold text-rose-800">{error}</Text>
        </View>
      ) : null}

      {categories.length === 0 ? (
        <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Text className="text-sm leading-5 text-amber-900">
            Belum ada kategori. Minta super admin membuat kategori di website agar laporan bisa dikirim.
          </Text>
        </View>
      ) : (
        <>
          {/* ─── Judul ────────────────────────────────────────────── */}
          <View className="mb-3 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-inkMuted">
              Judul Laporan
            </Text>
            <TextInput
              className="rounded-xl border border-stone-200 bg-cream-100 px-4 py-3 text-base text-ink"
              value={header}
              onChangeText={setHeader}
              placeholder="Ringkas, jelas, dan spesifik"
              placeholderTextColor="#a8a29e"
              maxLength={255}
            />
          </View>

          {/* ─── Isi laporan ─────────────────────────────────────── */}
          <View className="mb-3 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-inkMuted">
              Isi Laporan
            </Text>
            <TextInput
              className="min-h-[110px] rounded-xl border border-stone-200 bg-cream-100 px-4 py-3 text-base text-ink"
              value={body}
              onChangeText={setBody}
              placeholder="Detail: lokasi, waktu, kronologi kejadian..."
              placeholderTextColor="#a8a29e"
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* ─── Kategori ─────────────────────────────────────────── */}
          <View className="mb-3 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-inkMuted">
              Kategori
            </Text>
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
                    className={`rounded-full px-4 py-2.5 ${
                      active
                        ? 'border-2 border-peach-500 bg-cream-200'
                        : 'border border-stone-200 bg-stone-50'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${active ? 'text-ink' : 'text-stone-500'}`}
                    >
                      {c.category_name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ─── Lokasi ───────────────────────────────────────────── */}
          <View className="mb-3 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
            <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-inkMuted">
              Lokasi (Opsional)
            </Text>
            <LocationSelector onLocationSelected={handleLocationSelected} />
          </View>

          {/* ─── Foto ─────────────────────────────────────────────── */}
          <View className="mb-5 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
            <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-inkMuted">
              Foto Bukti (Opsional)
            </Text>
            <Text className="mb-3 text-[12px] text-stone-400">
              Maks. {MAX_IMAGES} foto · JPG, PNG, GIF · Maks. 5 MB per foto
            </Text>

            {/* Grid thumbnail foto */}
            {pickedImages.length > 0 && (
              <View className="mb-3 flex-row flex-wrap gap-2">
                {pickedImages.map((img, idx) => (
                  <View key={idx} className="relative">
                    <Image
                      source={{ uri: img.uri }}
                      className="h-24 w-24 rounded-2xl bg-stone-100"
                      resizeMode="cover"
                    />
                    {/* Tombol hapus */}
                    <Pressable
                      onPress={() => removeImage(idx)}
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full bg-rose-500"
                    >
                      <Text className="text-[11px] font-bold text-white">✕</Text>
                    </Pressable>
                    {/* Nomor urut */}
                    <View className="absolute bottom-1 left-1 rounded-full bg-black/40 px-1.5 py-0.5">
                      <Text className="text-[10px] font-bold text-white">{idx + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {pickedImages.length < MAX_IMAGES ? (
              <Pressable
                onPress={pickFromLibrary}
                className="flex-row items-center gap-2 self-start rounded-2xl border border-dashed border-stone-300 bg-cream-100 px-4 py-3"
              >
                <Text className="text-xl text-stone-400">📷</Text>
                <View>
                  <Text className="font-bold text-ink">
                    {pickedImages.length === 0 ? 'Pilih foto' : 'Tambah foto'}
                  </Text>
                  <Text className="text-[11px] text-stone-400">
                    {pickedImages.length}/{MAX_IMAGES} terpilih
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className="rounded-xl bg-green-50 px-3 py-2">
                <Text className="text-xs font-semibold text-green-700">
                  ✓ {MAX_IMAGES} foto sudah dipilih (batas maksimal)
                </Text>
              </View>
            )}
          </View>

          {/* ─── Tombol kirim ─────────────────────────────────────── */}
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            className={`rounded-3xl bg-peach-500 py-4 shadow-clay ${!canSubmit ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-base font-bold text-white">🚀 Kirim Laporan</Text>
            )}
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
