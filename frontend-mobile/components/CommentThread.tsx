import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MessageSquare, Send, Reply, Edit2, Trash2 } from 'lucide-react-native';
import type { Comment } from '@/lib/api/types';
import {
  createComment,
  updateComment,
  deleteComment,
} from '@/lib/api/commentsApi';
import { useAuth } from '@/context/AuthContext';

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type SingleCommentProps = {
  comment: Comment;
  reportId: number;
  depth?: number;
  onRefresh: () => void;
};

function SingleComment({ comment, reportId, depth = 0, onRefresh }: SingleCommentProps) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [busy, setBusy] = useState(false);

  const isOwn = user?.id === comment.user_id || user?.username === comment.username;
  const replies = comment.replies || [];

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      await createComment(reportId, replyText, comment.id);
      setReplyText('');
      setShowReply(false);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { message?: string };
      Alert.alert('Gagal', e.message || 'Gagal mengirim balasan.');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setBusy(true);
    try {
      await updateComment(comment.id, editText);
      setEditMode(false);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { message?: string };
      Alert.alert('Gagal', e.message || 'Gagal mengubah komentar.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Hapus tanggapan', 'Apakah Anda yakin ingin menghapus tanggapan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(comment.id);
            onRefresh();
          } catch (err: unknown) {
            const e = err as { message?: string };
            Alert.alert('Gagal', e.message || 'Gagal menghapus.');
          }
        },
      },
    ]);
  };

  return (
    <View
      className={`rounded-2xl border border-slate-200/90 bg-white p-3.5 ${
        depth > 0 ? 'ml-3 mt-2 border-l-2 border-l-emerald-500 bg-slate-50/50' : 'mb-2.5 shadow-xs'
      }`}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
              <Text className="text-[9px] font-semibold text-emerald-800">
                {comment.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xs font-semibold text-slate-800 tracking-tight">
              {comment.username}
            </Text>
          </View>
          <Text className="mt-0.5 text-[10px] text-slate-400 font-normal">
            {formatDate(comment.created_at)}
          </Text>
        </View>

        {user ? (
          <View className="flex-row items-center gap-2.5">
            {depth < 3 ? (
              <Pressable
                onPress={() => setShowReply((v) => !v)}
                className="flex-row items-center gap-1 py-0.5"
              >
                <Text className="text-[11px] font-medium text-emerald-700">Balas</Text>
              </Pressable>
            ) : null}
            {isOwn ? (
              <Pressable
                onPress={() => {
                  setEditMode((v) => !v);
                  setEditText(comment.comment);
                }}
                className="py-0.5"
              >
                <Text className="text-[11px] font-medium text-slate-500">Edit</Text>
              </Pressable>
            ) : null}
            {isOwn ? (
              <Pressable onPress={handleDelete} className="py-0.5">
                <Text className="text-[11px] font-medium text-rose-600">Hapus</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {editMode ? (
        <View className="mt-2.5 gap-2">
          <TextInput
            className="min-h-[56px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-normal leading-relaxed"
            value={editText}
            onChangeText={setEditText}
            multiline
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleEdit}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 active:bg-emerald-700"
            >
              <Text className="text-xs font-medium text-white">Simpan</Text>
            </Pressable>
            <Pressable
              onPress={() => setEditMode(false)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
            >
              <Text className="text-xs font-medium text-slate-600">Batal</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text className="mt-2 text-xs leading-relaxed text-slate-600 font-normal">
          {comment.comment}
        </Text>
      )}

      {showReply ? (
        <View className="mt-2.5 gap-2 border-t border-slate-100 pt-2.5">
          <TextInput
            className="min-h-[56px] rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-xs text-slate-800 font-normal leading-relaxed"
            value={replyText}
            onChangeText={setReplyText}
            placeholder={`Tulis balasan untuk ${comment.username}...`}
            placeholderTextColor="#94A3B8"
            multiline
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleReply}
              disabled={busy || !replyText.trim()}
              className={`rounded-lg bg-emerald-600 px-3 py-1.5 active:bg-emerald-700 ${
                busy || !replyText.trim() ? 'opacity-60' : ''
              }`}
            >
              <Text className="text-xs font-medium text-white">Kirim Balasan</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowReply(false);
                setReplyText('');
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5"
            >
              <Text className="text-xs font-medium text-slate-600">Batal</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {replies.map((reply) => (
        <SingleComment
          key={reply.id}
          comment={reply}
          reportId={reportId}
          depth={depth + 1}
          onRefresh={onRefresh}
        />
      ))}
    </View>
  );
}

type Props = {
  reportId: number;
  comments: Comment[];
  onRefresh: () => void;
};

export default function CommentThread({ reportId, comments, onRefresh }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createComment(reportId, text);
      setText('');
      onRefresh();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Gagal mengirim komentar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="rounded-[28px] border border-slate-200/90 bg-white/95 p-5 shadow-xs space-y-3">
      <View className="flex-row items-center justify-between pb-2 border-b border-slate-100">
        <View className="flex-row items-center gap-2">
          <MessageSquare size={16} color="#10B981" />
          <Text className="text-sm font-semibold tracking-tight text-slate-900">
            Diskusi & Tanggapan
          </Text>
        </View>

        {comments.length > 0 ? (
          <View className="rounded-full bg-slate-100 px-2 py-0.5">
            <Text className="text-[11px] font-medium text-slate-600">{comments.length} komentar</Text>
          </View>
        ) : null}
      </View>

      {comments.length === 0 ? (
        <Text className="py-4 text-center text-xs text-slate-400 font-normal italic">
          Belum ada tanggapan untuk laporan ini. Berikan tanggapan pertama Anda!
        </Text>
      ) : (
        <View className="pt-1">
          {comments.map((c) => (
            <SingleComment key={c.id} comment={c} reportId={reportId} onRefresh={onRefresh} />
          ))}
        </View>
      )}

      {user ? (
        <View className="mt-3 gap-2 border-t border-slate-100 pt-3">
          {error ? (
            <View className="rounded-xl border border-rose-200 bg-rose-50 p-2.5">
              <Text className="text-xs font-medium text-rose-800">{error}</Text>
            </View>
          ) : null}
          <TextInput
            className="min-h-[76px] rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 font-normal leading-relaxed"
            value={text}
            onChangeText={setText}
            placeholder="Tuliskan saran, klarifikasi, atau informasi tambahan..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || !text.trim()}
            className={`flex-row items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 shadow-xs active:bg-emerald-700 ${
              submitting || !text.trim() ? 'opacity-60' : ''
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Send size={13} color="#ffffff" />
                <Text className="text-xs font-medium text-white">Kirim Tanggapan</Text>
              </>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
