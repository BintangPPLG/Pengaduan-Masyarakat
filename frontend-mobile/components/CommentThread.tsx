import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MessageSquare } from 'lucide-react-native';
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
    Alert.alert('Hapus komentar', 'Yakin hapus komentar ini?', [
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
    <View className={`rounded-2xl border border-stone-200 bg-white p-3 ${depth > 0 ? 'ml-4 mt-2' : 'mb-2'}`}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-ink">{comment.username}</Text>
          <Text className="text-[10px] text-inkMuted">{formatDate(comment.created_at)}</Text>
        </View>
        {user ? (
          <View className="flex-row gap-2">
            {depth < 3 ? (
              <Pressable onPress={() => setShowReply((v) => !v)}>
                <Text className="text-[11px] font-bold text-peach-600">Balas</Text>
              </Pressable>
            ) : null}
            {isOwn ? (
              <Pressable onPress={() => { setEditMode((v) => !v); setEditText(comment.comment); }}>
                <Text className="text-[11px] font-bold text-stone-500">Edit</Text>
              </Pressable>
            ) : null}
            {isOwn ? (
              <Pressable onPress={handleDelete}>
                <Text className="text-[11px] font-bold text-rose-600">Hapus</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {editMode ? (
        <View className="mt-2 gap-2">
          <TextInput
            className="min-h-[60px] rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-ink"
            value={editText}
            onChangeText={setEditText}
            multiline
          />
          <View className="flex-row gap-2">
            <Pressable onPress={handleEdit} disabled={busy} className="rounded-xl bg-peach-500 px-3 py-2">
              <Text className="text-xs font-bold text-white">Simpan</Text>
            </Pressable>
            <Pressable onPress={() => setEditMode(false)} className="rounded-xl border border-stone-200 px-3 py-2">
              <Text className="text-xs font-bold text-stone-600">Batal</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text className="mt-2 text-sm leading-5 text-stone-600">{comment.comment}</Text>
      )}

      {showReply ? (
        <View className="mt-2 gap-2">
          <TextInput
            className="min-h-[60px] rounded-xl border border-peach-200 bg-white px-3 py-2 text-sm text-ink"
            value={replyText}
            onChangeText={setReplyText}
            placeholder={`Balas ${comment.username}...`}
            multiline
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleReply}
              disabled={busy || !replyText.trim()}
              className={`rounded-xl bg-peach-500 px-3 py-2 ${busy || !replyText.trim() ? 'opacity-60' : ''}`}
            >
              <Text className="text-xs font-bold text-white">Kirim</Text>
            </Pressable>
            <Pressable onPress={() => { setShowReply(false); setReplyText(''); }} className="rounded-xl border border-stone-200 px-3 py-2">
              <Text className="text-xs font-bold text-stone-600">Batal</Text>
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
    <View className="rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
      <View className="mb-3 flex-row items-center gap-2">
        <MessageSquare size={18} color="#56B97E" />
        <Text className="text-lg font-extrabold text-ink">Diskusi</Text>
        {comments.length > 0 ? (
          <View className="rounded-full bg-cream-200 px-2 py-0.5">
            <Text className="text-xs font-bold text-peach-600">{comments.length}</Text>
          </View>
        ) : null}
      </View>

      {comments.length === 0 ? (
        <Text className="py-4 text-center text-sm text-inkMuted italic">
          Belum ada komentar. Jadilah yang pertama!
        </Text>
      ) : (
        comments.map((c) => (
          <SingleComment key={c.id} comment={c} reportId={reportId} onRefresh={onRefresh} />
        ))
      )}

      {user ? (
        <View className="mt-4 gap-2 border-t border-stone-100 pt-4">
          {error ? (
            <View className="rounded-xl border border-rose-200 bg-rose-50 p-2">
              <Text className="text-sm text-rose-800">{error}</Text>
            </View>
          ) : null}
          <TextInput
            className="min-h-[88px] rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-base text-ink"
            value={text}
            onChangeText={setText}
            placeholder="Tulis tanggapan atau informasi tambahan..."
            multiline
            textAlignVertical="top"
          />
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || !text.trim()}
            className={`rounded-3xl bg-peach-500 py-3 ${submitting || !text.trim() ? 'opacity-60' : ''}`}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-[15px] font-bold text-white">Kirim Komentar</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
