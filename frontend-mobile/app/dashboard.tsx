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
    if (scope !== 'mine' || !user?.username) return reports;
    return reports.filter((r) => r.username === user.username);
  }, [reports, scope, user?.username]);

  const stats = useMemo(() => {
    const list = scope === 'mine' ? visible : reports;
    const total = list.length;
    const pending = list.filter((r) => r.status === 'pending').length;
    const approved = list.filter((r) => r.status === 'approved').length;
    const rejected = list.filter((r) => r.status === 'rejected').length;
    return { total, pending, approved, rejected };
  }, [reports, visible, scope]);

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
        className="flex-1 items-center justify-center gap-3 bg-cream-100"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#6FCF97" />
        <Text className="text-sm text-inkMuted">Memuat laporan...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream-100" style={{ paddingTop: insets.top }}>
      <View className="absolute -right-16 top-10 h-48 w-48 rounded-full bg-peach-400/25" />
      <View className="absolute -left-20 top-52 h-40 w-40 rounded-full bg-peach-300/30" />

      <View className="z-10 flex-row items-start justify-between px-4 pb-3">
        <View className="flex-1 pr-2">
          <Text className="self-start rounded-full bg-cream-200 px-3 py-1 text-[11px] font-extrabold text-ink">
            Dashboard
          </Text>
          <Text className="mt-2 text-[22px] font-extrabold text-ink">Laporan Anda</Text>
          <Text className="mt-1 text-sm text-inkMuted">Halo, {user.username}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => setScope('all')}
              className={`rounded-full px-3 py-1.5 ${scope === 'all' ? 'bg-peach-500' : 'border border-stone-200 bg-white/90'}`}
            >
              <Text
                className={`text-xs font-bold ${scope === 'all' ? 'text-white' : 'text-ink'}`}
              >
                Semua
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setScope('mine')}
              className={`rounded-full px-3 py-1.5 ${scope === 'mine' ? 'bg-peach-500' : 'border border-stone-200 bg-white/90'}`}
            >
              <Text
                className={`text-xs font-bold ${scope === 'mine' ? 'text-white' : 'text-ink'}`}
              >
                Milik saya
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={logout}
          className="rounded-2xl border border-stone-200/80 bg-white/90 px-3 py-2 shadow-clay-sm"
        >
          <Text className="text-[13px] font-semibold text-ink">Keluar</Text>
        </Pressable>
      </View>

      <View className="z-10 mx-4 mb-3 flex-row flex-wrap gap-2">
        {[
          { k: 'total', label: 'Total', v: stats.total },
          { k: 'p', label: 'Pending', v: stats.pending },
          { k: 'a', label: 'Disetujui', v: stats.approved },
          { k: 'r', label: 'Ditolak', v: stats.rejected },
        ].map((s) => (
          <View
            key={s.k}
            className="min-w-[22%] flex-1 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-clay-sm"
          >
            <Text className="text-[10px] font-bold uppercase tracking-wide text-inkMuted">
              {s.label}
            </Text>
            <Text className="text-lg font-extrabold text-ink">{s.v}</Text>
          </View>
        ))}
      </View>

      <Link href="/laporan/new" asChild>
        <Pressable className="z-10 mx-4 mb-3 rounded-3xl bg-peach-500 py-3.5 shadow-clay active:opacity-90">
          <Text className="text-center text-[15px] font-bold text-white">+ Laporan baru</Text>
        </Pressable>
      </Link>

      {error ? (
        <View className="z-10 mx-4 mb-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2">
          <Text className="text-sm text-rose-800">{error}</Text>
        </View>
      ) : null}

      {visible.length === 0 && !error ? (
        <View className="z-10 mx-4 items-center rounded-3xl border border-white/80 bg-white/90 p-8 shadow-clay-sm">
          <Text className="text-center text-sm text-inkMuted">
            {scope === 'mine' ? 'Belum ada laporan dari akun Anda.' : 'Belum ada laporan.'}
          </Text>
        </View>
      ) : visible.length > 0 ? (
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6FCF97" />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 24,
            gap: 14,
          }}
          renderItem={({ item: r }) => {
            const locInfo = parseLocationFromBody(r.body);
            const cleanBody = locInfo ? locInfo.cleanBody : r.body;
            const preview = cleanBody.length > 140 ? `${cleanBody.slice(0, 140)}…` : cleanBody;
            return (
              <Pressable
                onPress={() => router.push(`/laporan/${r.id}`)}
                className="rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay active:opacity-95"
              >
                <View className="flex-row items-start gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-cream-200">
                    <Text className="text-xl">📋</Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="flex-1 text-base font-extrabold text-ink" numberOfLines={2}>
                        {r.header}
                      </Text>
                      <View className={`rounded-full px-2.5 py-1 ${statusBadgeClass(r.status)}`}>
                        <Text
                          className={`text-[11px] font-bold capitalize ${statusTextClass(r.status)}`}
                        >
                          {r.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-1 text-[11px] text-inkMuted">
                      {r.category_name} · {r.username} · {formatDate(r.created_at)}
                    </Text>
                    <Text className="mt-2 text-sm leading-5 text-stone-600">{preview}</Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      ) : null}
    </View>
  );
}
