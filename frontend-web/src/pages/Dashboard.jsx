import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle,
  MapPin,
  Calendar,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { fetchReports } from '../api/reportsApi';
import { useAuth } from '../context/AuthContext';
import { parseLocationFromBody } from '../utils/locationHelper';
import { ReportCardSkeleton, StatCardSkeleton } from '../components/Skeleton';
import TiltCard3D from '../components/TiltCard3D';

function statusBadge(status) {
  if (status === 'approved') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      label: 'Disetujui',
      dot: 'bg-emerald-500',
    };
  }
  if (status === 'rejected') {
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      label: 'Ditolak',
      dot: 'bg-rose-500',
    };
  }
  return {
    bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    label: 'Menunggu Review',
    dot: 'bg-amber-500',
  };
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const isUser = user?.role === 'user';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scope, setScope] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const data = await fetchReports();
        if (!cancelled) setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat laporan.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter based on scope, search, and category
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchScope =
        scope === 'all' || (scope === 'mine' && r.username === user?.username);
      const matchSearch =
        !searchQuery ||
        r.header?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || r.category_name === selectedCategory;

      return matchScope && matchSearch && matchCategory;
    });
  }, [reports, scope, searchQuery, selectedCategory, user?.username]);

  // Extract categories for filtering
  const categories = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      if (r.category_name) set.add(r.category_name);
    });
    return Array.from(set);
  }, [reports]);

  const stats = useMemo(() => {
    const list =
      scope === 'mine' && user?.username
        ? reports.filter((r) => r.username === user.username)
        : reports;
    return {
      total: list.length,
      pending: list.filter((r) => r.status === 'pending').length,
      approved: list.filter((r) => r.status === 'approved').length,
      rejected: list.filter((r) => r.status === 'rejected').length,
    };
  }, [reports, scope, user?.username]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-4">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/70 p-6 shadow-sm space-y-4">
          <div className="h-5 w-28 bg-slate-200 animate-pulse rounded-full" />
          <div className="h-8 w-56 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <ReportCardSkeleton />
          <ReportCardSkeleton />
          <ReportCardSkeleton />
          <ReportCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Header Banner */}
      <div className="rounded-[32px] border border-slate-200/90 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Dashboard Informasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Daftar Pengaduan Masyarakat
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              Pantau perkembangan pengaduan fasilitas publik dan aspirasi warga secara transparan dan akuntabel.
            </p>
          </div>

          {isUser && (
            <Link
              to="/laporan/baru"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-medium text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Buat Pengaduan Baru</span>
            </Link>
          )}
        </div>

        {/* 3D Stat Counters */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Total Pengaduan',
              value: stats.total,
              icon: FileText,
              color: 'text-slate-900',
              bgIcon: 'bg-slate-100 text-slate-600',
            },
            {
              label: 'Menunggu Review',
              value: stats.pending,
              icon: Clock,
              color: 'text-amber-700',
              bgIcon: 'bg-amber-50 text-amber-600',
            },
            {
              label: 'Telah Disetujui',
              value: stats.approved,
              icon: CheckCircle2,
              color: 'text-emerald-700',
              bgIcon: 'bg-emerald-50 text-emerald-600',
            },
            {
              label: 'Laporan Ditolak',
              value: stats.rejected,
              icon: XCircle,
              color: 'text-rose-700',
              bgIcon: 'bg-rose-50 text-rose-600',
            },
          ].map((s) => (
            <TiltCard3D key={s.label} maxTilt={8} scale={1.02} className="h-full">
              <div className="h-full rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bgIcon}`}>
                    <s.icon size={14} />
                  </div>
                </div>
                <div className={`mt-2 text-2xl font-semibold tracking-tight ${s.color}`}>
                  {s.value}
                </div>
              </div>
            </TiltCard3D>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Scope selector */}
        {isUser && (
          <div className="flex items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm text-xs font-medium">
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`rounded-full px-4 py-1.5 transition ${
                scope === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Laporan
            </button>
            <button
              type="button"
              onClick={() => setScope('mine')}
              className={`rounded-full px-4 py-1.5 transition ${
                scope === 'mine'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laporan Saya
            </button>
          </div>
        )}

        {/* Search input & category picker */}
        <div className="flex flex-1 sm:justify-end items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {filteredReports.length === 0 && !error ? (
        <div className="rounded-[32px] border border-slate-200/80 bg-white/70 p-14 text-center shadow-sm backdrop-blur-xl">
          <FileText className="mx-auto mb-3 text-slate-300" size={40} />
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada pengaduan ditemukan</h3>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian lain.'
              : isUser && scope === 'mine'
              ? 'Anda belum memiliki laporan yang dibuat.'
              : 'Belum ada pengaduan publik yang tercatat.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredReports.map((r) => {
            const locInfo = parseLocationFromBody(r.body);
            const cleanBody = locInfo ? locInfo.cleanBody : r.body;
            const preview = cleanBody?.length > 130 ? `${cleanBody.slice(0, 130)}…` : cleanBody;
            const badge = statusBadge(r.status);

            return (
              <TiltCard3D key={r.id} maxTilt={6} scale={1.01} className="h-full">
                <Link
                  to={`/laporan/${r.id}`}
                  className="group flex h-full flex-col justify-between rounded-[28px] border border-slate-200/90 bg-white/85 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-300/80 backdrop-blur-xl"
                >
                  <div className="space-y-3">
                    {/* Top row: Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {r.category_name}
                      </span>

                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.bg}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {r.header}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {preview}
                    </p>
                  </div>

                  {/* Bottom: Location & Date */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-normal">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px] text-slate-600">
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {locInfo?.address ? locInfo.address : 'Lokasi Terlampir'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                      <Calendar size={12} />
                      <span>{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </TiltCard3D>
            );
          })}
        </div>
      )}
    </div>
  );
}
