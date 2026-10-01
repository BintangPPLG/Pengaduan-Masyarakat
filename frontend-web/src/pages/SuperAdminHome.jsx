import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Tags, Settings, ArrowRight, ShieldCheck, Download,
  BarChart2, RefreshCw, AlertTriangle, FileStack, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStatsSummary } from '../api/reportsApi';
import { fetchCategories } from '../api/categoriesApi';
import ExportPdfDialog from '../components/ExportPdfDialog';

const cards = [
  {
    to: '/superadmin/users',
    icon: Users,
    title: 'Kelola User',
    description: 'Buat akun baru, ubah role user/admin, dan hapus pengguna.',
    color: '#F2994A',
  },
  {
    to: '/superadmin/categories',
    icon: Tags,
    title: 'Kelola Kategori',
    description: 'Tambah, edit, dan hapus kategori laporan pengaduan.',
    color: '#6FCF97',
  },
  {
    to: '/admin/dashboard',
    icon: BarChart2,
    title: 'Statistik Lengkap',
    description: 'Grafik dan ringkasan data pengaduan secara detail.',
    color: '#60A5FA',
  },
];

function SuperAdminHome() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    if (!isSuperAdmin) return;
    setError('');
    setLoading(true);
    try {
      const [basic, cats] = await Promise.all([fetchStatsSummary(), fetchCategories()]);
      setStats(basic);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isSuperAdmin) {
    return (
      <div className="page">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Akses ditolak.
        </div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Jumlah User', value: stats?.users, icon: Users, color: '#60A5FA' },
    { label: 'Total Laporan', value: stats?.reports, icon: FileStack, color: '#F2994A' },
    { label: 'Disetujui', value: stats?.approved, icon: CheckCircle2, color: '#34D399' },
    { label: 'Ditolak', value: stats?.rejected, icon: AlertTriangle, color: '#F87171' },
    { label: 'Pending', value: stats?.pending, icon: ShieldCheck, color: '#FBBF24' },
  ];

  return (
    <div className="page max-w-5xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                 style={{ backgroundColor: '#FFF4ED', color: '#C05621' }}>
              <Settings size={14} /> Super Admin
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800">Panel Sistem</h1>
            <p className="mt-2 text-sm text-slate-500">
              Selamat datang, <span className="font-semibold text-slate-700">{user?.username}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={load} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {summaryCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl text-white"
                     style={{ backgroundColor: s.color }}>
                  <Icon size={16} />
                </div>
                <p className="text-[10px] font-bold uppercase text-slate-400">{s.label}</p>
                <p className="text-2xl font-black text-slate-800">{s.value ?? '-'}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.to} to={card.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                   style={{ backgroundColor: card.color }}>
                <Icon size={20} />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800">{card.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold transition group-hover:gap-2"
                    style={{ color: card.color }}>
                Buka <ArrowRight size={14} />
              </span>
            </Link>
          );
        })}
      </div>

      {showExport && (
        <ExportPdfDialog categories={categories} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

export default SuperAdminHome;
