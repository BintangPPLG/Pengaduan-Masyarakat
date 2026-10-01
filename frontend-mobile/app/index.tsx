import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShieldCheck,
  ArrowRight,
  Send,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';

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
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: insets.top }}>
      {/* Background ambient lighting */}
      <View className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-emerald-300/15" />
      <View className="absolute -left-20 top-72 h-56 w-56 rounded-full bg-teal-200/15" />

      {/* Header Bar */}
      <View className="z-10 flex-row items-center justify-between border-b border-slate-200/60 bg-white/80 px-5 py-3">
        <View className="flex-row items-center gap-2.5">
          <View className="h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 shadow-xs">
            <ShieldCheck size={16} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-semibold tracking-tight text-slate-900">
              SuaraWarga
            </Text>
            <Text className="text-[10px] text-slate-400 font-normal">
              Aspirasi digital masyarakat
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Link href="/login" asChild>
            <Pressable className="rounded-full border border-slate-200 bg-white px-3 py-1.5 active:bg-slate-50">
              <Text className="text-xs font-medium text-slate-600">Masuk</Text>
            </Pressable>
          </Link>
          <Link href="/register" asChild>
            <Pressable className="rounded-full bg-emerald-600 px-3.5 py-1.5 shadow-xs active:bg-emerald-700">
              <Text className="text-xs font-medium text-white">Daftar</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        className="z-10 flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 28,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View className="rounded-[28px] border border-slate-200/90 bg-white/95 p-6 shadow-xs">
          <View className="mb-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
            <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <Text className="text-[11px] font-medium text-emerald-800">
              Platform Pengaduan Publik
            </Text>
          </View>

          <Text className="text-2xl font-semibold tracking-tight text-slate-900 leading-snug">
            Sampaikan Aspirasi & Keluhan Lingkungan Secara Transparan
          </Text>

          <Text className="mt-2.5 text-xs leading-relaxed text-slate-500 font-normal">
            Laporkan jalan rusak, lampu mati, saluran mampet, atau layanan fasilitas umum lengkap dengan koordinat peta dan foto bukti. Terintegrasi langsung dengan tim verifikasi web.
          </Text>

          <View className="mt-6 gap-2.5">
            <Link href="/register" asChild>
              <Pressable className="flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 shadow-xs active:bg-emerald-700">
                <Text className="text-sm font-medium text-white">Mulai Buat Pengaduan</Text>
                <ArrowRight size={14} color="#ffffff" />
              </Pressable>
            </Link>
            <Link href="/login" asChild>
              <Pressable className="rounded-xl border border-slate-200 bg-white py-3.5 active:bg-slate-50">
                <Text className="text-center text-sm font-medium text-slate-700">
                  Masuk ke Akun Warga
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Section Title */}
        <View className="px-1 pt-1">
          <Text className="text-sm font-semibold tracking-tight text-slate-900">
            Fitur Unggulan Mobile
          </Text>
          <Text className="text-[11px] text-slate-500 font-normal">
            Dirancang praktis untuk kemudahan pelaporan di genggaman
          </Text>
        </View>

        {/* Feature Cards */}
        <FeatureItem
          icon={<Send size={16} color="#059669" />}
          iconBg="bg-emerald-50 border-emerald-100"
          title="Penyaluran Aspirasi Cepat"
          description="Laporan Anda tersimpan rapi dan langsung masuk ke dashboard verifikasi petugas secara realtime."
        />

        <FeatureItem
          icon={<MapPin size={16} color="#0D9488" />}
          iconBg="bg-teal-50 border-teal-100"
          title="Presisi Lokasi & GPS"
          description="Sematkan koordinat lokasi akurat dari peta interaktif agar petugas mudah menemukan titik kejadian."
        />

        <FeatureItem
          icon={<MessageSquare size={16} color="#0284C7" />}
          iconBg="bg-sky-50 border-sky-100"
          title="Diskusi Interaktif Terbuka"
          description="Berikan keterangan tambahan atau tanggapi pembaruan status laporan secara transparan bersama warga lain."
        />

        <FeatureItem
          icon={<CheckCircle2 size={16} color="#16A34A" />}
          iconBg="bg-green-50 border-green-100"
          title="Status Pemantauan Jelas"
          description="Pantau tahapan laporan Anda mulai dari menunggu review, disetujui, hingga tindak lanjut selesai."
        />

        {/* Modern Dark Footer Card */}
        <View className="mt-2 rounded-[24px] border border-slate-800 bg-slate-900 p-5 shadow-xs">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded-lg bg-emerald-500">
              <ShieldCheck size={14} color="#0F172A" />
            </View>
            <Text className="text-sm font-semibold text-white tracking-tight">SuaraWarga</Text>
          </View>

          <Text className="mt-2 text-xs leading-relaxed text-slate-400 font-normal">
            Platform pengaduan masyarakat modern untuk transparansi pelayanan lingkungan sekitar.
          </Text>

          <View className="mt-4 flex-row items-center gap-3 border-t border-slate-800/80 pt-3">
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-xs font-medium text-emerald-400">Masuk Akun</Text>
              </Pressable>
            </Link>
            <Text className="text-xs text-slate-600">·</Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-xs font-medium text-emerald-400">Pendaftaran</Text>
              </Pressable>
            </Link>
          </View>

          <Text className="mt-3 text-[10px] text-slate-500 font-normal">
            © {new Date().getFullYear()} SuaraWarga · Selaras dengan Desain Web
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <View className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <View className="flex-row items-start gap-3">
        <View className={`h-8 w-8 items-center justify-center rounded-xl border ${iconBg}`}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-xs font-semibold text-slate-800 tracking-tight">{title}</Text>
          <Text className="mt-1 text-[11px] leading-relaxed text-slate-500 font-normal">
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}
