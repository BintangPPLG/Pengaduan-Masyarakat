import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import TiltCard3D from './TiltCard3D';

export default function Hero3DCard() {
  return (
    <TiltCard3D
      maxTilt={16}
      scale={1.03}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative rounded-[32px] border border-slate-200/80 bg-white/85 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-2xl">
        {/* Subtle ambient gradient mesh in card */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-teal-300/10 blur-2xl" />

        {/* Card Header Layer */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
              Pengaduan Aktif
            </span>
          </div>

          <div
            style={{ transform: 'translateZ(35px)' }}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm"
          >
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Terverifikasi Petugas</span>
          </div>
        </div>

        {/* Card Title & Meta */}
        <div className="relative z-10 mt-5 space-y-1.5" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              Infrastruktur
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-normal">
              <Clock size={11} /> 15 menit lalu
            </span>
          </div>
          <h4 className="text-lg font-semibold tracking-tight text-slate-900">
            Perbaikan Drainase & Lampu Jalan Utama
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Saluran air tersumbat material proyek dan lampu penerangan mati sepanjang 100 meter, berpotensi banjir saat hujan deras.
          </p>
        </div>

        {/* Interactive 3D Floating Map Snapshot */}
        <div
          style={{ transform: 'translateZ(45px)' }}
          className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50 shadow-md group/map transition-transform"
        >
          {/* Faux Leaflet Styled Grid Map */}
          <div className="relative h-32 w-full overflow-hidden bg-[#E5E3DF]">
            {/* Map Roads & Blocks */}
            <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="road-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D1CEC7" strokeWidth="6" />
                  <path d="M 0 30 L 60 30" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                  <path d="M 30 0 L 30 60" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#road-grid)" />
              <circle cx="50%" cy="50%" r="28" fill="#10B981" fillOpacity="0.15" />
            </svg>

            {/* Glowing Map Radar Marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="absolute h-9 w-9 rounded-full bg-emerald-500/25 animate-ping" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-white">
                <MapPin size={16} className="fill-white/20" />
              </div>
            </div>

            {/* Bottom Map Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-xl bg-white/90 px-3 py-1.5 backdrop-blur-md border border-white/80 text-[11px] font-medium text-slate-700 shadow-sm">
              <span className="flex items-center gap-1 truncate">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                Jl. Margonda Raya No. 42 (Leaflet GPS)
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 font-semibold">
                -6.368, 106.832
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Layer */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="relative z-10 mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium"
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MessageSquare size={14} className="text-emerald-600" />
              14 Tanggapan Warga
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700">
            <span>Lihat Alur</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </TiltCard3D>
  );
}
