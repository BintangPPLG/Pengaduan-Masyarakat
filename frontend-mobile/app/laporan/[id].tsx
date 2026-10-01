import { fetchCommentsByReport } from '@/lib/api/commentsApi';
import { fetchReportById } from '@/lib/api/reportsApi';
import type { Comment, Report } from '@/lib/api/types';
import { getImageUrl } from '@/lib/imageUrl';
import { useProtectedUser } from '@/hooks/use-protected-user';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { parseLocationFromBody } from '@/lib/locationHelper';
import LocationPreview from '@/components/LocationPreview';
import CommentThread from '@/components/CommentThread';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function statusBadgeClass(status: string) {
  if (status === 'approved') return 'bg-emerald-100';
  if (status === 'rejected') return 'bg-rose-100';
  return 'bg-amber-100';
}

function statusTextClass(status: string) {
  if (status === 'approved') return 'text-emerald-800';
  if (status === 'rejected') return 'text-rose-800';
  return 'text-amber-900';
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ReportDetailScreen() {
  useProtectedUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const [r, c] = await Promise.all([
        fetchReportById(id),
        fetchCommentsByReport(id),
      ]);
      setReport(r);
      setComments(Array.isArray(c) ? c : []);
    } catch (err: unknown) {
      setReport(null);
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Laporan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadAll();
  }, [loadAll]);

  const refreshComments = async () => {
    if (!id) return;
    const c = await fetchCommentsByReport(id);
    setComments(Array.isArray(c) ? c : []);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-cream-100" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color="#6FCF97" />
        <Text className="text-sm text-inkMuted">Memuat...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="flex-1 bg-cream-100 p-4" style={{ paddingTop: insets.top }}>
        <View className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
          <Text className="text-sm text-rose-800">{error || 'Data tidak ada.'}</Text>
        </View>
        <Pressable onPress={() => router.replace('/dashboard')} className="mt-4">
          <Text className="text-sm font-bold text-peach-600">Kembali ke daftar</Text>
        </Pressable>
      </View>
    );
  }

  const imgSrc = getImageUrl(report.image);
  const locationInfo = parseLocationFromBody(report.body);
  const displayBody = locationInfo ? locationInfo.cleanBody : report.body;

  return (
    <ScrollView
      className="flex-1 bg-cream-100"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} className="mb-3">
        <Text className="text-sm">
          <Text className="font-bold text-peach-600">Daftar laporan</Text>
          <Text className="text-inkMuted"> / Detail</Text>
        </Text>
      </Pressable>

      <View className="mb-3 rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
        <Text className="mb-2 self-start rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-extrabold text-ink">
          Detail Laporan
        </Text>
        <View className="flex-row items-start justify-between gap-2">
          <Text className="min-w-0 flex-1 text-[22px] font-extrabold text-ink">{report.header}</Text>
          <View className={`rounded-full px-2.5 py-1 ${statusBadgeClass(report.status)}`}>
            <Text className={`text-[11px] font-bold capitalize ${statusTextClass(report.status)}`}>
              {report.status}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-xs text-inkMuted">
          Kategori: {report.category_name} · Pelapor: {report.username} · {formatDate(report.created_at)}
        </Text>
        {report.rejected_reason ? (
          <View className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <Text className="text-xs font-bold text-rose-900">Alasan penolakan</Text>
            <Text className="mt-1 text-sm text-rose-900">{report.rejected_reason}</Text>
          </View>
        ) : null}
        <Text className="mt-3.5 text-[15px] leading-6 text-stone-600">{displayBody}</Text>
        {imgSrc ? (
          <Image source={{ uri: imgSrc }} className="mt-4 h-60 w-full rounded-2xl bg-stone-100" resizeMode="contain" />
        ) : null}
        {locationInfo ? (
          <LocationPreview
            latitude={locationInfo.latitude}
            longitude={locationInfo.longitude}
            address={locationInfo.address}
          />
        ) : null}
      </View>

      <CommentThread reportId={Number(id)} comments={comments} onRefresh={refreshComments} />
    </ScrollView>
  );
}
