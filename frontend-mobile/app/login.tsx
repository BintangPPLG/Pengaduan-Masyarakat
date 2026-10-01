import { loginRequest } from '@/lib/api/authApi';
import { useAuth } from '@/context/AuthContext';
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
import { ShieldCheck, ArrowLeft, LogIn, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email.trim(), password);
      if (data.user.role !== 'user') {
        setError('Akun admin atau super admin hanya dapat masuk melalui portal website.');
        return;
      }
      login(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const payload = e.response?.data;
      setError(
        payload?.message || payload?.error || e.message || 'Gagal masuk. Periksa kembali email dan password Anda.'
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
                Masuk ke Akun
              </Text>
              <Text className="text-[11px] text-slate-400 font-normal">
                Khusus masyarakat & pelapor warga
              </Text>
            </View>
          </View>

          <Text className="text-xs leading-relaxed text-slate-500 font-normal">
            Gunakan akun warga Anda untuk menyampaikan pengaduan lingkungan dan memantau status tindak lanjut.
          </Text>

          {/* Error Banner */}
          {error ? (
            <View className="flex-row items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <AlertCircle size={14} color="#E11D48" className="mt-0.5" />
              <Text className="flex-1 text-xs font-medium text-rose-800 leading-tight">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View className="space-y-3.5 pt-1">
            <View>
              <Text className="mb-1 text-xs font-medium text-slate-700">Email Pengguna</Text>
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
                placeholder="Masukkan kata sandi..."
                placeholderTextColor="#94A3B8"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={loading || !email.trim() || !password}
              className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 shadow-xs active:bg-emerald-700 ${
                loading || !email.trim() || !password ? 'opacity-60' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <LogIn size={14} color="#ffffff" />
                  <Text className="text-xs font-medium text-white">Masuk Sekarang</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Footer note */}
          <View className="mt-2 border-t border-slate-100 pt-4 flex-row items-center justify-center gap-1.5">
            <Text className="text-xs text-slate-500 font-normal">Belum memiliki akun?</Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-xs font-medium text-emerald-700">Daftar Akun Warga</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
