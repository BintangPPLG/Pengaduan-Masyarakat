import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Gavel, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchReports,
  updateReportStatusWithReason,
  deleteReport,
} from '../api/reportsApi';

function statusClass(status) {
  if (status === 'approved') return 'bg-emerald-100 text-emerald-800';
  if (status === 'rejected') return 'bg-rose-100 text-rose-800';
  return 'bg-amber-100 text-amber-900';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function AdminModeration() {
  const { user, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectReasonById, setRejectReasonById] = useState({});
  const [filter, setFilter] = useState('pending');

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === 'pending').length,
      approved: reports.filter((r) => r.status === 'approved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
    };
  }, [reports]);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setReason = (id, value) => {
    setRejectReasonById((prev) => ({ ...prev, [id]: value }));
  };

  const approve = async (id) => {
    setBusyId(id);
    try {
      await updateReportStatusWithReason(id, 'approved');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal approve laporan.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    const reason = (rejectReasonById[id] || '').trim();
    if (!reason) {
      setError('Alasan reject wajib diisi.');
      return;
    }
    setBusyId(id);
    try {
      await updateReportStatusWithReason(id, 'rejected', reason);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reject laporan.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    const ok = window.confirm('Hapus laporan ini? Tindakan ini tidak bisa dibatalkan.');
    if (!ok) return;
    setBusyId(id);
    try {
      await deleteReport(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus laporan.');
    } finally {
      setBusyId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="alert alert-error">Akses ditolak.</div>
      </div>
    );
  }

  return (
    <div className="page space-y-5">
      <div className="relative overflow-hidden rounded-3xl2 border border-white/80 bg-softWhite p-6 shadow-clay backdrop-blur-xl">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-peach-400/15 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cream-200 px-3 py-1 text-xs font-bold text-ink">
              <Gavel size={14} className="text-peach-500" />
              Admin Panel
            </div>
            <h1 className="text-3xl font-extrabold text-ink">Moderasi Laporan</h1>
            <p className="mt-2 text-sm text-stone-600">
              Masuk sebagai <strong>{user?.username}</strong> ({user?.role}) — setiap laporan tampil
              sebagai kartu siap ditinjau.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-11 rounded-2xl border border-white/80 bg-white/95 px-3 text-sm text-stone-700 shadow-clay-sm outline-none ring-peach-400/30 focus:ring-4"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">Semua</option>
            </select>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-bold text-stone-700 shadow-clay-sm transition hover:border-peach-300 hover:text-peach-600"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Semua', value: stats.total },
            { label: 'Pending', value: stats.pending, accent: 'text-amber-700' },
            { label: 'Disetujui', value: stats.approved, accent: 'text-emerald-700' },
            { label: 'Ditolak', value: stats.rejected, accent: 'text-rose-700' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/90 bg-white/95 p-3 shadow-clay-sm"
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                {s.label}
              </div>
              <div className={`mt-1 text-2xl font-extrabold ${s.accent || 'text-ink'}`}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-stone-500">Memuat…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl2 border border-white/80 bg-softWhite p-10 text-center shadow-clay backdrop-blur-xl">
          <ClipboardList className="mx-auto mb-3 text-peach-400" size={40} />
          <p className="text-sm text-stone-600">Tidak ada laporan untuk filter ini.</p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="flex flex-col rounded-3xl2 border border-white/90 bg-softWhite p-5 shadow-clay backdrop-blur-xl"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <Link
                  to={`/laporan/${r.id}`}
                  className="text-lg font-bold text-ink hover:text-peach-600"
                >
                  {r.header}
                </Link>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass(
                    r.status
                  )}`}
                >
                  {r.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {r.category_name} · {r.username} · {formatDate(r.created_at)}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                {r.body?.length > 120 ? `${r.body.slice(0, 120)}…` : r.body}
              </p>

              <div className="mt-4 flex-1 space-y-3 border-t border-peach-200/40 pt-4">
                {r.status === 'pending' ? (
                  <>
                    <label className="block text-sm font-semibold text-ink">
                      Alasan reject
                      <input
                        type="text"
                        value={rejectReasonById[r.id] || ''}
                        onChange={(e) => setReason(r.id, e.target.value)}
                        placeholder="Wajib jika reject"
                        className="mt-1.5 h-11 w-full rounded-2xl border border-white/80 bg-white/95 px-3 text-sm shadow-inner outline-none ring-peach-400/25 focus:ring-4"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="h-10 rounded-full bg-gradient-to-r from-peach-500 to-peach-400 px-5 text-sm font-bold text-white shadow-clay-sm transition hover:-translate-y-0.5 disabled:opacity-60"
                        disabled={busyId === r.id}
                        onClick={() => approve(r.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="h-10 rounded-full border border-rose-200 bg-white px-5 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                        disabled={busyId === r.id}
                        onClick={() => reject(r.id)}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-1 rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
                        disabled={busyId === r.id}
                        onClick={() => remove(r.id)}
                      >
                        <Trash2 size={15} />
                        Hapus
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-1 rounded-full border border-stone-200 bg-white px-4 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
                      disabled={busyId === r.id}
                      onClick={() => remove(r.id)}
                    >
                      <Trash2 size={15} />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminModeration;
