import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationsApi';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICONS = {
  report_created: '📋',
  report_approved: '✅',
  report_rejected: '❌',
  report_completed: '🎉',
  comment_new: '💬',
  comment_reply: '↩️',
  admin_reply: '👮',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function NotificationBell() {
  const { unreadCount, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications({ limit: 8 });
      setItems(data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!open) loadNotifications();
    setOpen((v) => !v);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
    refresh();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/95 shadow-sm transition hover:bg-[#E2F8EB] hover:border-[#6FCF97]/50"
        aria-label="Notifikasi"
      >
        <Bell size={17} className="text-slate-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6FCF97] text-[10px] font-extrabold text-white shadow"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-white/80 bg-white/95 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#6FCF97]" />
                <span className="text-sm font-extrabold text-[#1E293B]">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#E2F8EB] px-2 py-0.5 text-[10px] font-bold text-[#56B97E]">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    title="Tandai semua sudah dibaca"
                    className="rounded-lg p-1.5 text-slate-400 hover:text-[#56B97E] transition"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-[340px] overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Bell size={32} className="text-slate-200" />
                  <p className="text-sm text-slate-400">Belum ada notifikasi</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          if (!n.is_read) handleMarkRead(n.id);
                        }}
                        className={`w-full px-4 py-3 text-left transition hover:bg-slate-50/80 ${
                          !n.is_read ? 'bg-[#F0FBF4]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-base leading-none">
                            {TYPE_ICONS[n.type] || '🔔'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold ${!n.is_read ? 'text-[#1E293B]' : 'text-slate-500'}`}>
                              {n.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                              {n.message}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6FCF97]" />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-3">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block w-full rounded-xl bg-[#E2F8EB] py-2 text-center text-xs font-bold text-[#56B97E] transition hover:bg-[#6FCF97] hover:text-white"
              >
                Lihat Semua Notifikasi
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
