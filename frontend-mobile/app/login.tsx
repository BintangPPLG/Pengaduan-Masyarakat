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
        setError('Akun admin atau super admin hanya dapat masuk melalui website.');
        return;
      }
      login(data.token, data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const payload = e.response?.data;
      setError(
        payload?.message || payload?.error || e.message || 'Gagal masuk. Periksa koneksi Anda.'
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
        <View className="absolute right-0 top-8 h-40 w-40 rounded-full bg-peach-300 opacity-35" />
        <Text className="text-[26px] font-extrabold text-ink">Welcome Back</Text>
        <Text className="mt-2 text-[15px] text-inkMuted">
          Masuk untuk melanjutkan pelaporan masyarakat.
        </Text>

        {error ? (
          <View className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <Text className="text-sm text-rose-800">{error}</Text>
          </View>
        ) : null}

        <Text className="mb-1.5 mt-6 text-sm font-semibold text-ink">Email</Text>
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
          placeholder="Password"
          placeholderTextColor="#a8a29e"
          secureTextEntry
          autoComplete="password"
        />

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className={`mt-2 rounded-3xl bg-peach-500 py-3.5 shadow-clay ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-base font-bold text-white">Sign In</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row flex-wrap justify-center">
          <Text className="text-[15px] text-inkMuted">Belum punya akun? </Text>
          <Link href="/register" asChild>
            <Pressable>
              <Text className="text-[15px] font-bold text-peach-600">Daftar</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
