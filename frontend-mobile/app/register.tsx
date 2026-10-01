import { registerRequest } from '@/lib/api/authApi';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      await registerRequest(username.trim(), email.trim(), password);
      setSuccess('Registrasi akun warga berhasil! Mengalihkan ke halaman masuk...');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const payload = e.response?.data;
      setError(
        payload?.message || payload?.error || e.message || 'Pendaftaran gagal. Silakan coba kembali.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F8FAFC]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background ambient lighting */}
      <View className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-emerald-300/15" />
      <View className="absolute -left-20 top-80 h-56 w-56 rounded-full bg-teal-200/15" />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link */}
        <Pressable
          onPress={() => router.back()}
          className="mb-5 flex-row items-center gap-1.5 self-start py-1"
        >
          <ArrowLeft size={14} color="#64748B" />
          <Text className="text-xs font-medium text-slate-500">Beranda</Text>
        </Pressable>

        {/* Card Container */}
        <View className="rounded-[28px] border border-slate-200/90 bg-white/95 p-6 shadow-xs space-y-4">
          {/* Logo & Header */}
          <View className="flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-xs">
              <ShieldCheck size={18} color="#ffffff" />
            </View>
            <View>
              <Text className="text-base font-semibold tracking-tight text-slate-900">
                Pendaftaran Akun
              </Text>
              <Text className="text-[11px] text-slate-400 font-normal">
                Bergabung menyuarakan aspirasi warga
              </Text>
            </View>
          </View>

          <Text className="text-xs leading-relaxed text-slate-500 font-normal">
            Daftarkan akun masyarakat untuk mulai mengirim laporan fasilitas, jalan, dan lingkungan.
          </Text>

          {/* Feedback Banners */}
          {error ? (
            <View className="flex-row items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <AlertCircle size={14} color="#E11D48" className="mt-0.5" />
              <Text className="flex-1 text-xs font-medium text-rose-800 leading-tight">
                {error}
              </Text>
            </View>
          ) : null}

          {success ? (
            <View className="flex-row items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 size={14} color="#059669" className="mt-0.5" />
              <Text className="flex-1 text-xs font-medium text-emerald-800 leading-tight">
                {success}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="space-y-3 pt-1">
            <View>
              <Text className="mb-1 text-xs font-medium text-slate-700">Nama Pengguna (Username)</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-normal"
                value={username}
                onChangeText={setUsername}
                placeholder="contoh: budi_santoso"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View>
              <Text className="mb-1 text-xs font-medium text-slate-700">Alamat Email Aktif</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-normal"
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="mb-1 text-xs font-medium text-slate-700">Kata Sandi</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-normal"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View>
              <Text className="mb-1 text-xs font-medium text-slate-700">Konfirmasi Kata Sandi</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-normal"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ulangi kata sandi yang sama"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={loading || !username.trim() || !email.trim() || !password}
              className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 shadow-xs active:bg-emerald-700 ${
                loading || !username.trim() || !email.trim() || !password ? 'opacity-60' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <UserPlus size={14} color="#ffffff" />
                  <Text className="text-xs font-medium text-white">Daftar Akun Sekarang</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer note */}
          <View className="mt-2 border-t border-slate-100 pt-4 flex-row items-center justify-center gap-1.5">
            <Text className="text-xs text-slate-500 font-normal">Sudah memiliki akun?</Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-xs font-medium text-emerald-700">Masuk di Sini</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
