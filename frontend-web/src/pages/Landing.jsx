import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  ArrowRight,
  CheckCircle2,
  MessagesSquare,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  Globe2,
  Lock,
  ChevronRight,
  Compass,
} from 'lucide-react';
import Hero3DCard from '../components/Hero3DCard';
import TiltCard3D from '../components/TiltCard3D';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -left-40 top-[-100px] h-[550px] w-[550px] rounded-full bg-emerald-300/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-150px] top-[20%] h-[500px] w-[500px] rounded-full bg-teal-200/15 blur-[130px]" />
      <div className="pointer-events-none absolute left-1/3 top-[60%] h-[600px] w-[600px] rounded-full bg-emerald-200/10 blur-[150px]" />

      {/* Floating Island Header */}
      <header className="sticky top-5 z-40 px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 transition-transform duration-300 group-hover:scale-105">
              <ShieldCheck size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                SuaraWarga
              </span>
              <span className="text-[10px] text-slate-400 font-normal -mt-0.5">
                Aspirasi Digital Publik
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#fitur" className="transition hover:text-emerald-600">
              Fitur Utama
            </a>
            <a href="#peta" className="transition hover:text-emerald-600">
              Integrasi Leaflet
            </a>
            <a href="#alur" className="transition hover:text-emerald-600">
              Alur Lapor
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-full px-4 text-xs font-medium text-slate-700 transition hover:bg-slate-100/80"
            >
              Masuk
            </Link>

            <Link
              to="/register"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-medium text-white shadow-sm shadow-emerald-600/25 transition duration-200 hover:bg-emerald-700 active:scale-[0.98]"
            >
              <span>Daftar Akun</span>
              <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 lg:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Left Column: Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/70 px-3.5 py-1 text-xs font-medium text-emerald-800">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Transparan · Presisi Koordinat · Responsif</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.18]">
              Aspirasi Warga Terdokumentasi,{' '}
              <span className="text-emerald-600 font-semibold">Tuntas Tertangani.</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Sampaikan keluhan infrastruktur, fasilitas umum, dan layanan publik secara langsung.
              Dilengkapi pemetaan koordinat presisi berbasis Leaflet OpenStreetMap untuk transparansi penuh dari pelaporan hingga verifikasi tuntas.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-emerald-600 pl-6 pr-3 text-sm font-medium text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
              >
                <span>Mulai Buat Laporan</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight size={14} />
                </span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Compass size={16} className="text-slate-500" />
                <span>Eksplor Laporan Publik</span>
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-xl font-semibold text-slate-900 tracking-tight">100%</div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">Berbasis Lokasi Peta</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 tracking-tight">3 Role</div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">Warga, Admin, Super Admin</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900 tracking-tight">Real-time</div>
                <div className="text-xs text-slate-500 font-normal mt-0.5">Audit & Notifikasi</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Holographic Card Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <Hero3DCard />
          </motion.div>
        </div>
      </section>

      {/* Section: Leaflet Interactive Map Feature Highlight */}
      <section id="peta" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-[36px] border border-slate-200/90 bg-white/85 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <Globe2 size={13} className="text-emerald-600" />
                <span>Teknologi Geospasial</span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Akurasi Titik Kejadian dengan Leaflet & GPS
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Bukan sekadar teks deskripsi. Pengguna web dapat memilih titik koordinat secara langsung di atas peta interaktif OpenStreetMap atau mendeteksi lokasi GPS dengan sekali klik.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Reverse Geocoding otomatis mengubah koordinat menjadi nama jalan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Kompatibel lintas perangkat: Dibuat di HP, akurat di peta Web</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Marker dinamis dengan popup info dan rincian lokasi kejadian</span>
                </li>
              </ul>
            </div>

            {/* Visual representation of Leaflet interface */}
            <div className="lg:col-span-7">
              <TiltCard3D maxTilt={10} className="w-full">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-emerald-600" />
                      Live Map View (Leaflet + OpenStreetMap)
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Layer Aktif
                    </span>
                  </div>
                  <div className="relative h-64 sm:h-72 w-full bg-[#E5E3DF] p-4 flex items-center justify-center overflow-hidden">
                    <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                      <pattern id="sec-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D1CEC7" strokeWidth="4" />
                        <path d="M 0 20 L 40 20" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                        <path d="M 20 0 L 20 40" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#sec-grid)" />
                    </svg>

                    {/* Multiple mock markers */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md text-xs font-medium text-slate-800 flex items-center gap-2 mb-2 backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Kecamatan Beji, Depok (-6.3721, 106.8284)</span>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl ring-4 ring-white">
                        <MapPin size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </section>

      {/* Section: 3D Feature Bento Grid */}
      <section id="fitur" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <Sparkles size={13} className="text-emerald-600" />
            <span>Keunggulan Sistem</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Dirancang Rapi untuk Warga dan Administrator
          </h2>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            Setiap alur sistem disesuaikan agar mudah diakses masyarakat, tertib bagi petugas, dan dapat dipertanggungjawabkan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <TiltCard3D maxTilt={14} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white/80 p-7 shadow-sm transition hover:shadow-lg hover:border-emerald-300 backdrop-blur-xl">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MapPin size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Pemetaan Presisi Leaflet
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                  Pinpoint lokasi akurat dengan dukungan OpenStreetMap, Nominatim Geocoding, dan GPS native tanpa batas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-emerald-600">
                <span>Terintegrasi Otomatis</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </TiltCard3D>

          {/* Card 2 */}
          <TiltCard3D maxTilt={14} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white/80 p-7 shadow-sm transition hover:shadow-lg hover:border-emerald-300 backdrop-blur-xl">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <MessagesSquare size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Diskusi & Komentar Berantai
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                  Warga dan petugas dapat saling berinteraksi dengan nested replies untuk klarifikasi kondisi lapangan terkini.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-teal-600">
                <span>Threaded Replies</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </TiltCard3D>

          {/* Card 3 */}
          <TiltCard3D maxTilt={14} className="h-full">
            <div className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white/80 p-7 shadow-sm transition hover:shadow-lg hover:border-emerald-300 backdrop-blur-xl">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Moderasi & Status Transparan
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
                  Persetujuan atau penolakan laporan wajib menyertakan alasan resmi, sehingga warga mengetahui tindak lanjut pastinya.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-slate-700">
                <span>Alur Akuntabel</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* Section: 3-Langkah Alur Lapor */}
      <section id="alur" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-[36px] border border-slate-200/80 bg-slate-900 text-white p-8 sm:p-14 overflow-hidden relative shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="max-w-xl space-y-2 mb-12">
            <span className="text-xs font-medium tracking-widest uppercase text-emerald-400">
              Alur Kerja
            </span>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white">
              Tiga Langkah Mudah Menyampaikan Masalah
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative z-10">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400 font-semibold text-sm border border-white/10">
                01
              </div>
              <h3 className="text-base font-medium text-white">Tulis & Pilih Titik Peta</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Deskripsikan keluhan, unggah foto bukti, dan tentukan lokasi kejadian di Leaflet Map.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400 font-semibold text-sm border border-white/10">
                02
              </div>
              <h3 className="text-base font-medium text-white">Verifikasi Admin Wilayah</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Petugas meninjau laporan, memberikan status persetujuan, atau meminta klarifikasi.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-400 font-semibold text-sm border border-white/10">
                03
              </div>
              <h3 className="text-base font-medium text-white">Tindak Lanjut & Tuntas</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Perkembangan penanganan diperbarui transparan hingga keluhan selesai ditangani.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white/60 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="font-semibold text-slate-800">SuaraWarga</span>
            <span>— Sistem Pengaduan & Aspirasi Publik</span>
          </div>

          <p>© {new Date().getFullYear()} SuaraWarga. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
