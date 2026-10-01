import { Link, NavLink } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  ShieldCheck,
  Settings,
  LogOut,
  UserCircle2,
  Users,
  Tags,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isUser = user?.role === 'user';
  const roleLabel =
    user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Warga';

  const linkBase =
    'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200';
  const linkIdle = 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900';
  const linkActive = 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                SuaraWarga
              </span>
              <span className="text-[10px] text-slate-400 font-normal -mt-0.5">
                Dashboard Publik
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex flex-wrap items-center gap-1.5">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
            >
              <Home size={14} />
              <span>Daftar Laporan</span>
            </NavLink>

            {isUser && (
              <NavLink
                to="/laporan/baru"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <PlusCircle size={14} />
                <span>Buat Pengaduan</span>
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin/moderasi"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <ShieldCheck size={14} />
                <span>Moderasi</span>
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <BarChart2 size={14} />
                <span>Statistik</span>
              </NavLink>
            )}

            {isSuperAdmin && (
              <NavLink
                to="/superadmin"
                end
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <Settings size={14} />
                <span>Sistem</span>
              </NavLink>
            )}

            {isSuperAdmin && (
              <NavLink
                to="/superadmin/users"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <Users size={14} />
                <span>Kelola User</span>
              </NavLink>
            )}

            {isSuperAdmin && (
              <NavLink
                to="/superadmin/categories"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                <Tags size={14} />
                <span>Kategori</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}

          {user && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600">
              <UserCircle2 size={16} className="text-emerald-600" />
              <span className="max-w-[120px] truncate font-medium text-slate-800">
                {user.username}
              </span>
              <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {roleLabel}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600 active:scale-95"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
