import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoriesApi';

function SuperAdminCategories() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [newName, setNewName] = useState('');
  const [editById, setEditById] = useState({});

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
      const map = {};
      (Array.isArray(data) ? data : []).forEach((c) => {
        map[c.id] = c.category_name || '';
      });
      setEditById(map);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    load();
  }, [isSuperAdmin]);

  const onCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusyId('create');
    setError('');
    try {
      await createCategory(name);
      setNewName('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah kategori.');
    } finally {
      setBusyId(null);
    }
  };

  const onUpdate = async (id) => {
    const name = (editById[id] || '').trim();
    if (!name) {
      setError('Nama kategori wajib diisi.');
      return;
    }
    setBusyId(id);
    setError('');
    try {
      await updateCategory(id, name);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update kategori.');
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm('Hapus kategori ini?');
    if (!ok) return;
    setBusyId(id);
    setError('');
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal hapus kategori.');
    } finally {
      setBusyId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="page">
        <div className="alert alert-error">Akses ditolak.</div>
      </div>
    );
  }

  return (
    <div className="page space-y-4">
      <p className="text-sm text-slate-500">
        <Link to="/superadmin" className="text-[#F97316] hover:underline">Panel Sistem</Link>
        <span> / </span>
        <span>Kategori</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-[#1E293B]">Kelola Kategori</h1>
        <button
          type="button"
          className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#F97316]/40 hover:text-[#F97316]"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">Tambah Kategori</h2>
        <form className="flex flex-wrap items-center gap-2" onSubmit={onCreate}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama kategori"
            className="h-10 min-w-[240px] rounded-xl border border-white/80 bg-white/85 px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
            required
          />
          <button
            type="submit"
            className="h-10 rounded-xl bg-[#F97316] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.38)] transition hover:-translate-y-0.5 hover:bg-[#EA580C]"
            disabled={busyId === 'create'}
          >
            {busyId === 'create' ? 'Menyimpan…' : 'Tambah'}
          </button>
        </form>
      </div>

      <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">Daftar Kategori</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat…</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada kategori.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 p-3"
              >
                <div className="min-w-[240px] flex-1">
                  <div className="mb-1 text-xs text-slate-500">ID: {c.id}</div>
                  <input
                    value={editById[c.id] ?? ''}
                    onChange={(e) =>
                      setEditById((p) => ({ ...p, [c.id]: e.target.value }))
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="h-10 rounded-xl bg-[#F97316] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.38)] transition hover:-translate-y-0.5 hover:bg-[#EA580C]"
                    onClick={() => onUpdate(c.id)}
                    disabled={busyId === c.id}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                    onClick={() => onDelete(c.id)}
                    disabled={busyId === c.id}
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SuperAdminCategories;

