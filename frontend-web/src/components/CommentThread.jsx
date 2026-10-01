import { useState } from 'react';
import { MessageSquare, Reply, Edit2, Trash2, Send, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createComment, updateComment, deleteComment } from '../api/commentsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function SingleComment({ comment, reportId, depth = 0, onRefresh, allComments }) {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [submitting, setSubmitting] = useState(false);

  const isOwn = user?.id === comment.user_id || user?.username === comment.username;
  const canDelete = isOwn || isAdmin;
  const replies = comment.replies || [];

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await createComment(reportId, replyText, comment.id);
      setReplyText('');
      setShowReplyForm(false);
      showToast('success', 'Balasan berhasil dikirim.');
      onRefresh();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await updateComment(comment.id, editText);
      setEditMode(false);
      showToast('success', 'Komentar berhasil diubah.');
      onRefresh();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal mengubah komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await deleteComment(comment.id);
      showToast('success', 'Komentar dihapus.');
      onRefresh();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  const borderColor = depth === 0
    ? 'border-slate-100/80'
    : depth === 1
    ? 'border-[#6FCF97]/20'
    : 'border-slate-100/50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${borderColor} bg-white/70 px-4 py-3 shadow-sm ${depth > 0 ? 'ml-6 mt-2' : ''}`}
    >
      {/* Avatar + Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6FCF97] to-[#56B97E] text-xs font-extrabold text-white shadow-sm">
            {comment.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <span className="text-sm font-bold text-[#1E293B]">{comment.username}</span>
            <span className="ml-2 text-[10px] text-slate-400">{formatDate(comment.created_at)}</span>
            {comment.updated_at && (
              <span className="ml-1 text-[10px] italic text-slate-300">(diedit)</span>
            )}
          </div>
        </div>

        {/* Actions */}
        {user && (
          <div className="flex items-center gap-1">
            {depth < 3 && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-[#E2F8EB] hover:text-[#56B97E]"
              >
                <Reply size={12} />
                Balas
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => { setEditMode((v) => !v); setEditText(comment.comment); }}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
              >
                <Edit2 size={12} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comment body */}
      {editMode ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#1E293B] outline-none ring-[#6FCF97]/20 focus:ring-4 transition"
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={submitting}
              className="flex items-center gap-1 rounded-xl bg-[#6FCF97] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#56B97E] disabled:opacity-60"
            >
              <Send size={11} /> Simpan
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <X size={11} /> Batal
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{comment.comment}</p>
      )}

      {/* Reply form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder={`Balas komentar ${comment.username}...`}
              className="w-full rounded-xl border border-[#6FCF97]/30 bg-white px-3 py-2 text-sm outline-none ring-[#6FCF97]/20 focus:ring-4 transition"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={submitting || !replyText.trim()}
                className="flex items-center gap-1 rounded-xl bg-[#6FCF97] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#56B97E] disabled:opacity-60"
              >
                <Send size={11} /> Kirim
              </button>
              <button
                onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                <X size={11} /> Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#56B97E] transition hover:underline"
          >
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showReplies ? 'Sembunyikan' : 'Tampilkan'} {replies.length} balasan
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 space-y-1"
              >
                {replies.map((reply) => (
                  <SingleComment
                    key={reply.id}
                    comment={reply}
                    reportId={reportId}
                    depth={depth + 1}
                    onRefresh={onRefresh}
                    allComments={allComments}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/**
 * CommentThread — full threaded comment section.
 * Props: reportId, comments (array dari backend), onRefresh
 */
export default function CommentThread({ reportId, comments, onRefresh }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createComment(reportId, text);
      setText('');
      showToast('success', 'Komentar berhasil dikirim.');
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim komentar.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[24px] border border-white/70 bg-[#FFFFFFCC] p-6 shadow-glass backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-[#1E293B]">
          <MessageSquare size={19} className="text-[#56B97E]" />
          Diskusi
          {comments.length > 0 && (
            <span className="ml-1 rounded-full bg-[#E2F8EB] px-2 py-0.5 text-xs font-bold text-[#56B97E]">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* Comment list */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <MessageSquare size={36} className="text-slate-200" />
            <p className="text-sm text-slate-400 italic">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        ) : (
          comments.map((c) => (
            <SingleComment
              key={c.id}
              comment={c}
              reportId={reportId}
              depth={0}
              onRefresh={onRefresh}
              allComments={comments}
            />
          ))
        )}
      </div>

      {/* New comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mt-2 pt-4 border-t border-slate-100 space-y-3">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6FCF97] to-[#56B97E] text-xs font-extrabold text-white shadow-sm">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={3}
              placeholder="Tulis tanggapan atau informasi tambahan..."
              className="flex-1 rounded-xl border border-white/80 bg-white/85 px-3 py-2.5 text-sm outline-none ring-[#6FCF97]/20 focus:ring-4 transition duration-200"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#6FCF97] hover:bg-[#56B97E] px-5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(111,207,151,0.25)] transition duration-200 active:scale-95 disabled:opacity-60"
            >
              <Send size={14} />
              {submitting ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 pt-4 border-t border-slate-100 text-center text-sm text-slate-400">
          <a href="/login" className="font-bold text-[#56B97E] hover:underline">Login</a> untuk menulis komentar.
        </p>
      )}
    </section>
  );
}
