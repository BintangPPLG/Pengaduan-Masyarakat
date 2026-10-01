import { useEffect, useState } from 'react';
import {
  BarChart2, TrendingUp, Calendar, Download, AlertTriangle,
  RefreshCw, Award, Activity,
} from 'lucide-react';
import { fetchAdvancedStats } from '../api/statsApi';
import { fetchCategories } from '../api/categoriesApi';
import ExportPdfDialog from '../components/ExportPdfDialog';
import { BarChartSimple, StatusChart, TrendChart } from '../components/SimpleCharts';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-xl"
           style={{ backgroundColor: color }} />
      <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white"
           style={{ backgroundColor: color }}>
        <Icon size={18} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-800">{value ?? '-'}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, cats] = await Promise.all([fetchAdvancedStats(), fetchCategories()]);
      setStats(s);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = stats?.summary || {};
  const perDay = stats?.perDay || [];
  const perMonth = stats?.perMonth || [];
  const byStatus = stats?.byStatus || [];
  const byCat = stats?.byCategory || [];

  const completionRate = summary.total
    ? Math.round((summary.approved / summary.total) * 100)
    : 0;

  const statCards = [
    { label: 'Total Laporan', value: summary.total, color: '#6FCF97', icon: BarChart2 },
    { label: 'Hari Ini', value: summary.today, color: '#60A5FA', icon: Calendar },
    { label: 'Minggu Ini', value: summary.thisWeek, color: '#818CF8', icon: TrendingUp },
    { label: 'Bulan Ini', value: summary.thisMonth, color: '#A78BFA', icon: Calendar },
    { label: 'Disetujui', value: summary.approved, color: '#34D399', icon: Award,
      sub: summary.total ? `${completionRate}% dari total` : undefined },
    { label: 'Pending', value: summary.pending, color: '#FBBF24', icon: AlertTriangle },
    { label: 'Ditolak', value: summary.rejected, color: '#F87171', icon: Activity },
  ];

  return (
    <div className="page max-w-6xl mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E2F8EB] px-3 py-1 text-xs font-bold text-[#56B97E]">
              <BarChart2 size={13} /> Dashboard Admin
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Statistik Pengaduan</h1>
            <p className="mt-1 text-sm text-slate-500">Data real-time sistem pengaduan masyarakat</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6FCF97] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#56B97E]">
              <Download size={15} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Gagal memuat data</p>
            <p className="text-xs mt-0.5">{error}</p>
            <button onClick={load} className="mt-1.5 text-xs font-bold underline">Coba lagi</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {statCards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Laporan Per Hari" subtitle="30 hari terakhir">
          {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            : <TrendChart data={perDay} dateKey="date" />}
        </SectionCard>
        <SectionCard title="Laporan Per Bulan" subtitle="12 bulan terakhir">
          {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            : <BarChartSimple data={perMonth} labelKey="month" valueKey="count" />}
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Distribusi Status" subtitle="Komposisi seluruh pengaduan">
          {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            : <StatusChart data={byStatus} />}
        </SectionCard>
        <SectionCard title="Top Kategori" subtitle="Berdasarkan jumlah laporan">
          {loading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
            : <BarChartSimple data={byCat.slice(0, 8)} labelKey="name" valueKey="count" />}
        </SectionCard>
      </div>

      {showExport && (
        <ExportPdfDialog categories={categories} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
