import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchReportById, updateReportStatusWithReason } from '../api/reportsApi';
import { fetchCommentsByReport } from '../api/commentsApi';
import { getImageUrl } from '../utils/imageUrl';
import MapPreview from '../components/MapPreview';
import CommentThread from '../components/CommentThread';
import { parseLocationFromBody } from '../utils/locationHelper';
import { useToast } from '../context/ToastContext';
import { ReportDetailSkeleton } from '../components/Skeleton';
import TiltCard3D from '../components/TiltCard3D';

function statusBadge(status) {
  if (status === 'approved') {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Laporan Disetujui',
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    };
  }
  if (status === 'rejected') {
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Laporan Ditolak',
      icon: XCircle,
      dot: 'bg-rose-500',
    };
  }
  return {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu Verifikasi',
    icon: Clock,
    dot: 'bg-amber-500',
  };
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ReportDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusBusy, setStatusBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [r, c] = await Promise.all([
        fetchReportById(id),
        fetchCommentsByReport(id),
      ]);
      setReport(r);
      setComments(Array.isArray(c) ? c : []);
    } catch (err) {
      setReport(null);
      const msg = err.response?.data?.message || 'Laporan tidak ditemukan.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    setLoading(true);
    loadAll();
  }, [id, loadAll]);

  const refreshComments = async () => {
    const c = await fetchCommentsByReport(id);
    setComments(Array.isArray(c) ? c : []);
  };

  const handleStatus = async (status) => {
    setStatusError('');
    setStatusBusy(true);
    try {
      await updateReportStatusWithReason(
        id,
        status,
        status === 'rejected' ? rejectReason : undefined
      );
      showToast(
        'success',
        status === 'approved' ? 'Laporan berhasil disetujui!' : 'Laporan berhasil ditolak.'
      );
      const r = await fetchReportById(id);
      setReport(r);
      if (status === 'approved') setRejectReason('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui status.';
      setStatusError(msg);
      showToast('error', msg);
    } finally {
      setStatusBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <ReportDetailSkeleton />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          {error || 'Data laporan tidak ditemukan.'}
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
        >
          <ArrowLeft size={14} /> Kembali ke daftar
        </Link>
      </div>
    );
  }

  const imgSrc = getImageUrl(report.image);
  const locationInfo = parseLocationFromBody(report.body);
  const displayBody = locationInfo ? locationInfo.cleanBody : report.body;
  const badge = statusBadge(report.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
      </div>

      {/* Main Report Card */}
      <article className="rounded-[32px] border border-slate-200/90 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-6">
        {/* Status & Category Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Tag size={12} className="text-emerald-600" />
              {report.category_name}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badge.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            {report.header}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-normal">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-emerald-600" />
              Pelapor: <span className="font-medium text-slate-700">{report.username}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              {formatDate(report.created_at)}
            </span>
          </div>
        </div>

        {/* Rejection notice if any */}
        {report.rejected_reason && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-rose-800">
              <AlertCircle size={14} />
              <span>Alasan Penolakan Petugas:</span>
            </div>
            <p className="text-rose-700 font-normal leading-relaxed pl-5">
              {report.rejected_reason}
            </p>
          </div>
        )}

        {/* Body Text */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-normal">
          {displayBody}
        </div>

        {/* Attached Photo */}
        {imgSrc && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <img
              src={imgSrc}
              alt="Bukti Laporan"
              className="max-h-[460px] w-full rounded-xl object-contain"
            />
          </div>
        )}

        {/* Leaflet Map Preview */}
        {locationInfo && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <MapPreview
              latitude={locationInfo.latitude}
              longitude={locationInfo.longitude}
              address={locationInfo.address}
            />
          </div>
        )}

        {/* Admin Moderation Bar (If logged in as admin) */}
        {isAdmin && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Tindakan Moderasi Administrator</span>
            </div>

            {statusError && (
              <div className="text-xs text-rose-700 font-medium">{statusError}</div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={statusBusy || report.status === 'approved'}
                onClick={() => handleStatus('approved')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-medium text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                <span>Setujui Laporan</span>
              </button>

              <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                <input
                  type="text"
                  placeholder="Alasan penolakan jika ditolak..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="h-9 flex-1 rounded-full border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={statusBusy || report.status === 'rejected' || !rejectReason.trim()}
                  onClick={() => handleStatus('rejected')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <XCircle size={14} />
                  <span>Tolak Laporan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Discussion Comments Thread */}
      <CommentThread
        reportId={Number(id)}
        comments={comments}
        onRefresh={refreshComments}
      />
    </div>
  );
}
