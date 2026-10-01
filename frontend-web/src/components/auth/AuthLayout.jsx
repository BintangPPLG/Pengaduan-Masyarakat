import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] px-4 py-12 flex items-center justify-center">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-teal-200/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-slate-200/80 bg-white/85 p-7 sm:p-9 shadow-xl shadow-slate-900/5 backdrop-blur-2xl"
        >
          {/* Brand Tag */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <ShieldCheck size={14} />
              </div>
              <span className="text-xs font-semibold text-slate-800 tracking-tight">SuaraWarga</span>
            </Link>

            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-100">
              Akses Resmi
            </span>
          </div>

          <div className="mb-6 space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">{subtitle}</p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="relative mb-6 grid grid-cols-2 rounded-full bg-slate-100/90 p-1 text-xs font-medium">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full bg-white shadow-xs ${
                isLogin ? 'left-1' : 'left-[calc(50%+3px)]'
              }`}
            />
            <Link
              to="/login"
              className={`relative z-10 py-1.5 text-center transition ${
                isLogin ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className={`relative z-10 py-1.5 text-center transition ${
                !isLogin ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Baru
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
