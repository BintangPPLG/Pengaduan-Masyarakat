import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ready, token, user } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (token && user?.role === 'user') {
      router.replace('/dashboard');
    }
  }, [ready, token, user, router]);

  return (
    <View className="flex-1 bg-cream-100" style={{ paddingTop: insets.top }}>
      <View className="absolute right-0 top-24 h-56 w-56 rounded-full bg-peach-300 opacity-40" />
      <View className="absolute -left-10 top-80 h-44 w-44 rounded-full bg-peach-400 opacity-30" />

      <View className="z-10 flex-row items-center justify-between border-b border-peach-300/40 bg-white/85 px-4 py-3">
        <View className="flex-row items-center gap-2.5">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-peach-500 shadow-clay-sm">
            <Text className="text-base font-black text-white">S</Text>
          </View>
          <View>
            <Text className="text-[15px] font-extrabold text-ink">SuaraWarga</Text>
            <Text className="text-[11px] text-inkMuted">Aspirasi digital masyarakat</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Link href="/login" asChild>
            <Pressable className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5">
              <Text className="text-sm font-semibold text-stone-600">Masuk</Text>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable className="rounded-2xl bg-peach-500 px-3.5 py-2.5 shadow-clay-sm">
              <Text className="text-sm font-bold text-white">Daftar</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        className="z-10 flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: insets.bottom + 20,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[26px] border border-white/90 bg-white/95 p-5 shadow-clay">
          <View className="mb-3 self-start rounded-full border border-peach-300/50 bg-cream-200 px-3 py-1.5">
            <Text className="text-[10px] font-extrabold uppercase tracking-wide text-stone-700">
              Platform resmi masyarakat
            </Text>
          </View>
          <Text className="text-2xl font-extrabold leading-8 text-ink">
            Tempat aman untuk menyampaikan{' '}
            <Text className="text-peach-600">keluhan & aspirasi warga</Text>
          </Text>
          <Text className="mt-3 text-[15px] leading-[22px] text-inkMuted">
            Laporkan jalan rusak, lampu mati, saluran, atau layanan publik — lengkap dengan foto. Satu
            sistem dengan admin di website.
          </Text>
          <View className="mt-5 gap-2.5">
            <Link href="/register" asChild>
              <Pressable className="rounded-3xl bg-peach-500 py-3.5 shadow-clay">
                <Text className="text-center text-[15px] font-bold text-white">Mulai lapor sekarang</Text>
              </Pressable>
            </Link>
            <Link href="/login" asChild>
              <Pressable className="rounded-3xl border border-stone-200 bg-white py-3.5">
                <Text className="text-center text-[15px] font-semibold text-stone-600">
                  Masuk ke akun
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
          <Text className="mb-2 text-[15px] font-bold text-ink">Kenapa platform ini dibuat?</Text>
          <Text className="text-sm leading-[21px] text-inkMuted">
            Agar suara warga tidak hilang: laporan rapi, bisa dilampiri foto, dan mudah dipantau bersama
            tim tindak lanjut.
          </Text>
        </View>

        <Feature
          title="Aspirasi tersalurkan"
          description="Setiap laporan membantu menyuarakan kebutuhan nyata di lingkungan sekitar."
        />
        <Feature
          title="Informasi lebih jelas"
          description="Format laporan rapi sehingga masalah di lapangan lebih mudah dipahami."
        />
        <Feature
          title="Ruang diskusi"
          description="Lengkapi informasi lewat komentar secara santun dan transparan."
        />
        <Feature
          title="Perubahan nyata"
          description="Dokumentasi yang baik meningkatkan peluang masalah ditangani."
        />

        <View className="mt-2 rounded-[22px] border border-peach-500/20 bg-stone-800 p-6 shadow-clay">
          <Text className="text-lg font-black text-white">SuaraWarga</Text>
          <Text className="mt-2.5 text-[13px] leading-5 text-stone-300">
            Wadah digital untuk keluhan, saran, dan harapan warga — selaras dengan tampilan website.
          </Text>
          <View className="mt-4 flex-row flex-wrap items-center">
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-peach-300">Masuk</Text>
              </Pressable>
            </Link>
            <Text className="text-sm text-stone-500"> · </Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-peach-300">Daftar</Text>
              </Pressable>
            </Link>
          </View>
          <Text className="mt-3 text-xs text-stone-400">info@suarawarga.local</Text>
          <Text className="mt-3 text-[11px] text-stone-500">
            © {new Date().getFullYear()} SuaraWarga · untuk warga
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <View className="overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-4 shadow-clay-sm">
      <View className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-peach-300 opacity-25" />
      <Text className="text-[15px] font-bold text-ink">{title}</Text>
      <Text className="mt-1.5 text-[13px] leading-5 text-inkMuted">{description}</Text>
    </View>
  );
}
