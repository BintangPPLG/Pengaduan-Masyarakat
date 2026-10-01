import { useState } from 'react';
import { X, Download, Filter, Calendar } from 'lucide-react';
import { exportReportsPdf } from '../api/statsApi';
import { useToast } from '../context/ToastContext';

export default function ExportPdfDialog({ categories = [], onClose }) {
  const { showToast } = useToast();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportReportsPdf({ dateFrom, dateTo, status, category_id: categoryId });
      showToast('success', 'PDF berhasil diunduh.');
      onClose();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal mengekspor PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-[#56B97E]" />
            <h2 className="text-base font-extrabold text-slate-800">Export PDF Pengaduan</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
              <Calendar size={12} /> Rentang Tanggal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
              <Filter size={12} /> Status
            </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Kategori</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.category_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handleExport} disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6FCF97] py-2.5 text-sm font-bold text-white hover:bg-[#56B97E] disabled:opacity-60">
            <Download size={14} />
            {loading ? 'Membuat PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
