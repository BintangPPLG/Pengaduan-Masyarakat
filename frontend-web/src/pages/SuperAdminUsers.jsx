import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, createUser, updateUserRole, deleteUser } from '../api/usersApi';

function SuperAdminUsers() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
  });

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat user.');
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
    setError('');
    setBusyId('create');
    try {
      await createUser(form);
      setForm({ username: '', email: '', password: '', role: 'admin' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat user.');
    } finally {
      setBusyId(null);
    }
  };

  const onRole = async (id, role) => {
    setError('');
    setBusyId(id);
    try {
      await updateUserRole(id, role);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal update role.');
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm('Hapus user ini?');
    if (!ok) return;
    setError('');
    setBusyId(id);
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal hapus user.');
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
        <span>User</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-[#1E293B]">Kelola User</h1>
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
        <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">Tambah Admin / User</h2>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={onCreate}>
          <label className="text-sm font-medium text-[#1E293B]">
            Username
            <input
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              className="mt-1 h-10 w-full rounded-xl border border-white/80 bg-white/85 px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
            />
          </label>
          <label className="text-sm font-medium text-[#1E293B]">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              className="mt-1 h-10 w-full rounded-xl border border-white/80 bg-white/85 px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
            />
          </label>
          <label className="text-sm font-medium text-[#1E293B]">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={3}
              className="mt-1 h-10 w-full rounded-xl border border-white/80 bg-white/85 px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
            />
          </label>
          <label className="text-sm font-medium text-[#1E293B]">
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-white/80 bg-white/85 px-3 text-sm outline-none ring-[#F97316]/20 focus:ring-4"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </label>
          <div className="md:col-span-2 xl:col-span-4">
            <button
              type="submit"
              className="h-10 rounded-xl bg-[#F97316] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(249,115,22,0.38)] transition hover:-translate-y-0.5 hover:bg-[#EA580C]"
              disabled={busyId === 'create'}
            >
              {busyId === 'create' ? 'Menyimpan…' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-5 shadow-glass backdrop-blur-xl">
        <h2 className="mb-3 text-lg font-semibold text-[#1E293B]">Daftar User</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat…</p>
        ) : (
          <div className="overflow-auto rounded-2xl border border-white/70 bg-white/70">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Username</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                  <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border-b border-slate-100 px-3 py-2">{u.id}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{u.username}</td>
                    <td className="border-b border-slate-100 px-3 py-2">{u.email}</td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <select
                        value={u.role}
                        onChange={(e) => onRole(u.id, e.target.value)}
                        disabled={busyId === u.id}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-[#F97316]/20 focus:ring-4"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <button
                        type="button"
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-600"
                        onClick={() => onDelete(u.id)}
                        disabled={busyId === u.id}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminUsers;

