import { useAuth } from '@/context/AuthContext';
import { fetchReports } from '@/lib/api/reportsApi';
import type { Report } from '@/lib/api/types';
import { useProtectedUser } from '@/hooks/use-protected-user';
import { Link, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseLocationFromBody } from '@/lib/locationHelper';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  Plus,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
} from 'lucide-react-native';

function statusStyle(status: string) {
  if (status === 'approved') {
    return {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      label: 'Disetujui',
    };
  }
  if (status === 'rejected') {
    return {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      dot: 'bg-rose-500',
      label: 'Ditolak',
    };
  }
  return {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Menunggu',
  };
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function DashboardScreen() {
  useProtectedUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, token, ready } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await fetchReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!ready || !token || user?.role !== 'user') return;
    load();
  }, [ready, token, user?.role, load]);

  const visible = useMemo(() => {
    let list = reports;
    if (scope === 'mine' && user?.username) {
      list = list.filter((r) => r.username === user.username);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.header?.toLowerCase().includes(q) ||
          r.body?.toLowerCase().includes(q) ||
          r.category_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [reports, scope, user?.username, search]);

  const stats = useMemo(() => {
    const list = scope === 'mine' && user?.username ? reports.filter((r) => r.username === user.username) : reports;
    const total = list.length;
    const pending = list.filter((r) => r.status === 'pending').length;
    const approved = list.filter((r) => r.status === 'approved').length;
    const rejected = list.filter((r) => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [reports, scope, user?.username]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (!ready || !user || user.role !== 'user') {
    return null;
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center gap-3 bg-[#F8FAFC]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-xs text-slate-500 font-medium">Memuat pengaduan...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      {/* Background ambient light */}
      <View className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-emerald-300/15" />
      <View className="absolute -left-20 top-60 h-56 w-56 rounded-full bg-teal-200/15" />

      {/* Header Bar */}
      <View className="z-10 flex-row items-center justify-between px-5 py-3 border-b border-slate-200/60 bg-white/80">
        <View className="flex-row items-center gap-2.5">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-emerald-600">
            <ShieldCheck size={16} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-semibold tracking-tight text-slate-900">
              SuaraWarga
            </Text>
            <Text className="text-[10px] text-slate-400 font-normal">
              Halo, {user.username}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={logout}
          className="flex-row items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 active:bg-slate-50"
        >
          <LogOut size={12} color="#64748B" />
          <Text className="text-xs font-medium text-slate-600">Keluar</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
        }}
        ListHeaderComponent={
          <View className="space-y-4 mb-4">
            {/* Title & Action */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-semibold tracking-tight text-slate-900">
                  Pengaduan Warga
                </Text>
                <Text className="text-xs text-slate-500 font-normal mt-0.5">
                  Pantau aspirasi dan perbaikan publik
                </Text>
              </View>

              <Link href="/laporan/new" asChild>
                <Pressable className="flex-row items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 shadow-xs active:bg-emerald-700">
                  <Plus size={14} color="#ffffff" />
                  <Text className="text-xs font-medium text-white">Lapor Baru</Text>
                </Pressable>
              </Link>
            </View>

            {/* 4 Stat Metrics */}
            <View className="flex-row flex-wrap gap-2.5 mt-2">
              {[
                { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-100' },
                { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Disetujui', value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Ditolak', value: stats.rejected, color: 'text-rose-700', bg: 'bg-rose-50' },
              ].map((s) => (
                <View
                  key={s.label}
                  className="flex-1 min-w-[22%] rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-xs"
                >
                  <Text className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {s.label}
                  </Text>
                  <Text className={`text-lg font-semibold tracking-tight mt-1 ${s.color}`}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Search Input */}
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs mt-1">
              <Search size={14} color="#94A3B8" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari pengaduan atau lokasi..."
                placeholderTextColor="#94A3B8"
                className="flex-1 ml-2 text-xs text-slate-800"
              />
            </View>

            {/* Scope Filter Tabs */}
            <View className="flex-row items-center rounded-full border border-slate-200 bg-white/90 p-1 self-start">
              <Pressable
                onPress={() => setScope('all')}
                className={`rounded-full px-3.5 py-1.5 ${
                  scope === 'all' ? 'bg-emerald-600 shadow-xs' : ''
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    scope === 'all' ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  Semua Laporan
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setScope('mine')}
                className={`rounded-full px-3.5 py-1.5 ${
                  scope === 'mine' ? 'bg-emerald-600 shadow-xs' : ''
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    scope === 'mine' ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  Laporan Saya
                </Text>
              </Pressable>
            </View>

            {error ? (
              <View className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                <Text className="text-xs text-rose-800 font-medium">{error}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <View className="items-center rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xs">
              <FileText size={32} color="#94A3B8" />
              <Text className="mt-2 text-xs font-medium text-slate-700 text-center">
                {search
                  ? 'Tidak ada laporan yang sesuai pencarian.'
                  : scope === 'mine'
                  ? 'Anda belum memiliki laporan yang diajukan.'
                  : 'Belum ada pengaduan masyarakat di sistem.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item: r }) => {
          const locInfo = parseLocationFromBody(r.body);
          const cleanBody = locInfo ? locInfo.cleanBody : r.body;
          const preview = cleanBody.length > 120 ? `${cleanBody.slice(0, 120)}…` : cleanBody;
          const badge = statusStyle(r.status);

          return (
            <Pressable
              onPress={() => router.push(`/laporan/${r.id}`)}
              className="mb-3.5 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-xs active:bg-slate-50/90"
            >
              <View className="space-y-2.5">
                {/* Category & Status */}
                <View className="flex-row items-center justify-between gap-2">
                  <View className="rounded-lg bg-slate-100 px-2.5 py-0.5 self-start">
                    <Text className="text-[11px] font-medium text-slate-600">
                      {r.category_name}
                    </Text>
                  </View>

                  <View
                    className={`flex-row items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${badge.bg}`}
                  >
                    <View className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                    <Text className={`text-[10px] font-medium ${badge.text}`}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text
                  className="text-base font-semibold tracking-tight text-slate-900 leading-snug"
                  numberOfLines={2}
                >
                  {r.header}
                </Text>

                {/* Body Excerpt */}
                <Text className="text-xs text-slate-600 font-normal leading-relaxed" numberOfLines={3}>
                  {preview}
                </Text>

                {/* Footer with Location & Date */}
                <View className="pt-2.5 border-t border-slate-100 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1 flex-1 pr-2">
                    <MapPin size={11} color="#10B981" />
                    <Text className="text-[11px] text-slate-500 font-normal truncate" numberOfLines={1}>
                      {locInfo?.address ? locInfo.address : 'Lokasi Terlampir'}
                    </Text>
                  </View>

                  <Text className="text-[10px] text-slate-400 font-normal shrink-0">
                    {formatDate(r.created_at)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
