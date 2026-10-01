import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationsApi';
import { useNotifications } from '../context/NotificationContext';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  report_created: 'Laporan Dibuat',
  report_approved: 'Laporan Disetujui',
  report_rejected: 'Laporan Ditolak',
  report_completed: 'Laporan Selesai',
  comment_new: 'Komentar Baru',
  comment_reply: 'Balasan Komentar',
  admin_reply: 'Balasan Admin',
};

const TYPE_ICONS = {
  report_created: '📋',
  report_approved: '✅',
  report_rejected: '❌',
  report_completed: '🎉',
  comment_new: '💬',
  comment_reply: '↩️',
  admin_reply: '👮',
};

const TYPE_COLORS = {
  report_created: 'bg-blue-50 text-blue-700 border-blue-100',
  report_approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  report_rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  report_completed: 'bg-purple-50 text-purple-700 border-purple-100',
  comment_new: 'bg-amber-50 text-amber-700 border-amber-100',
  comment_reply: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  admin_reply: 'bg-teal-50 text-teal-700 border-teal-100',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

function NotifSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export default function Notifications() {
  const { refresh: refreshBadge } = useNotifications();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = page, type = typeFilter) => {
    setLoading(true);
    try {
      const res = await fetchNotifications({ page: p, limit: 15, type: type || undefined });
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, typeFilter]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setData((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    refreshBadge();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setData((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    refreshBadge();
  };

  const handleTypeChange = (type) => {
    setTypeFilter(type);
    setPage(1);
  };

  const unreadInPage = data.filter((n) => !n.is_read).length;

  return (
    <div className="page max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-glass backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#6FCF97]/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E2F8EB] px-3 py-1 text-xs font-bold text-[#56B97E]">
              <Bell size={13} /> Notifikasi
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">Kotak Masuk</h1>
            <p className="mt-1 text-sm text-slate-500">Total {total} notifikasi</p>
          </div>
          {unreadInPage > 0 && (
            <button
              onClick={handleMarkAll}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6FCF97] px-4 py-2 text-sm font-bold text-white shadow-[0_6px_20px_rgba(111,207,151,0.2)] transition hover:bg-[#56B97E]"
            >
              <CheckCheck size={15} /> Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Filter by type */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleTypeChange('')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${!typeFilter ? 'bg-[#6FCF97] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#6FCF97]'}`}
          >
            Semua
          </button>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleTypeChange(key)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${typeFilter === key ? 'bg-[#6FCF97] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#6FCF97]'}`}
            >
              {TYPE_ICONS[key]} {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="rounded-[24px] border border-white/70 bg-white/70 shadow-glass backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-6"><NotifSkeleton /></div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Bell size={48} className="text-slate-200" />
            <p className="text-sm text-slate-400 font-medium">Belum ada notifikasi</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {data.map((n) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
              >
                <div
                  onClick={() => { if (!n.is_read) handleMarkRead(n.id); }}
                  className={`flex cursor-pointer items-start gap-4 px-6 py-4 transition hover:bg-slate-50/80 ${!n.is_read ? 'bg-[#F5FDF7]' : ''}`}
                >
                  <span className="mt-0.5 text-xl leading-none shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${!n.is_read ? 'text-[#1E293B]' : 'text-slate-500'}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_COLORS[n.type] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[#6FCF97]" />
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 p-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
