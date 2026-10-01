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
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await registerRequest(username.trim(), email.trim(), password);
      setSuccess('Registrasi berhasil. Silakan masuk.');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const payload = e.response?.data;
      setError(
        payload?.message || payload?.error || e.message || 'Registrasi gagal. Coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream-100"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[26px] font-extrabold text-ink">Create Account</Text>
        <Text className="mt-2 text-[15px] text-inkMuted">
          Buat akun baru untuk mulai mengirim laporan (role: warga).
        </Text>

        {error ? (
          <View className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <Text className="text-sm text-rose-800">{error}</Text>
          </View>
        ) : null}
        {success ? (
          <View className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <Text className="text-sm text-emerald-800">{success}</Text>
          </View>
        ) : null}

        <Text className="mb-1.5 mt-6 text-sm font-semibold text-ink">Username</Text>
        <TextInput
          className="mb-4 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-base text-ink"
          value={username}
          onChangeText={setUsername}
          placeholder="contoh: budi"
          placeholderTextColor="#a8a29e"
          autoCapitalize="none"
          autoComplete="username"
        />

        <Text className="mb-1.5 text-sm font-semibold text-ink">Email</Text>
        <TextInput
          className="mb-4 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-base text-ink"
          value={email}
          onChangeText={setEmail}
          placeholder="contoh@email.com"
          placeholderTextColor="#a8a29e"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <Text className="mb-1.5 text-sm font-semibold text-ink">Password</Text>
        <TextInput
          className="mb-4 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-base text-ink"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimal 6 karakter"
          placeholderTextColor="#a8a29e"
          secureTextEntry
          autoComplete="new-password"
        />

        <Text className="mb-1.5 text-sm font-semibold text-ink">Confirm Password</Text>
        <TextInput
          className="mb-4 rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-base text-ink"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Ulangi password"
          placeholderTextColor="#a8a29e"
          secureTextEntry
          autoComplete="new-password"
        />

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className={`mt-2 rounded-3xl bg-peach-500 py-3.5 shadow-clay ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-base font-bold text-white">Register</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-[15px] text-inkMuted">Sudah punya akun? </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text className="text-[15px] font-bold text-peach-600">Masuk</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
