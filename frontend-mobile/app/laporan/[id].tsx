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
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

function statusStyle(status: string) {
  if (status === 'approved') {
    return {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Laporan Disetujui',
    };
  }
  if (status === 'rejected') {
    return {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      label: 'Laporan Ditolak',
    };
  }
  return {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Menunggu Verifikasi',
  };
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
      <View
        className="flex-1 items-center justify-center gap-3 bg-[#F8FAFC]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-xs text-slate-500 font-medium">Memuat rincian...</Text>
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="flex-1 bg-[#F8FAFC] p-4" style={{ paddingTop: insets.top }}>
        <View className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <Text className="text-xs font-medium text-rose-800">{error || 'Data tidak ada.'}</Text>
        </View>
        <Pressable onPress={() => router.replace('/dashboard')} className="mt-4 self-start">
          <Text className="text-xs font-medium text-emerald-700">← Kembali ke daftar</Text>
        </Pressable>
      </View>
    );
  }

  const imgSrc = getImageUrl(report.image);
  const locationInfo = parseLocationFromBody(report.body);
  const displayBody = locationInfo ? locationInfo.cleanBody : report.body;
  const badge = statusStyle(report.status);

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAFC]"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center gap-1.5 self-start py-1"
      >
        <ArrowLeft size={14} color="#64748B" />
        <Text className="text-xs font-medium text-slate-500">Daftar Laporan</Text>
      </Pressable>

      {/* Main card */}
      <View className="mb-4 rounded-[32px] border border-slate-200/90 bg-white/95 p-5 shadow-xs space-y-4">
        {/* Category & Status */}
        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
          <View className="flex-row items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
            <Tag size={11} color="#10B981" />
            <Text className="text-[11px] font-medium text-slate-700">
              {report.category_name}
            </Text>
          </View>

          <View className={`flex-row items-center gap-1.5 rounded-full border px-2.5 py-1 ${badge.bg}`}>
            <View className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            <Text className={`text-[11px] font-medium ${badge.text}`}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-xl font-semibold tracking-tight text-slate-900 leading-snug">
          {report.header}
        </Text>

        {/* Reporter info & date */}
        <View className="flex-row items-center gap-3 text-xs text-slate-400">
          <View className="flex-row items-center gap-1">
            <User size={12} color="#10B981" />
            <Text className="text-[11px] font-medium text-slate-600">{report.username}</Text>
          </View>
          <Text className="text-[11px] text-slate-300">·</Text>
          <View className="flex-row items-center gap-1">
            <Calendar size={12} color="#94A3B8" />
            <Text className="text-[11px] text-slate-400 font-normal">
              {formatDate(report.created_at)}
            </Text>
          </View>
        </View>

        {/* Rejection Notice */}
        {report.rejected_reason ? (
          <View className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 space-y-1">
            <View className="flex-row items-center gap-1.5">
              <AlertCircle size={13} color="#E11D48" />
              <Text className="text-xs font-medium text-rose-800">Alasan Penolakan Petugas:</Text>
            </View>
            <Text className="text-xs text-rose-700 font-normal leading-relaxed pl-4">
              {report.rejected_reason}
            </Text>
          </View>
        ) : null}

        {/* Body Text */}
        <Text className="text-xs leading-6 text-slate-700 font-normal pt-1">
          {displayBody}
        </Text>

        {/* Image Attachment */}
        {imgSrc ? (
          <View className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <Image
              source={{ uri: imgSrc }}
              className="h-56 w-full rounded-xl"
              resizeMode="contain"
            />
          </View>
        ) : null}

        {/* Map Location Preview */}
        {locationInfo ? (
          <View className="pt-3 border-t border-slate-100">
            <LocationPreview
              latitude={locationInfo.latitude}
              longitude={locationInfo.longitude}
              address={locationInfo.address}
            />
          </View>
        ) : null}
      </View>

      {/* Discussion comments thread */}
      <CommentThread reportId={Number(id)} comments={comments} onRefresh={refreshComments} />
    </ScrollView>
  );
}
