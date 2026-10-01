import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCategories } from '../api/categoriesApi';
import { createReport } from '../api/reportsApi';
import MapSelector from '../components/MapSelector';
import { formatLocationForBody } from '../utils/locationHelper';
import { useToast } from '../context/ToastContext';
import { MapPin, AlertTriangle, ArrowLeft, Upload, CheckCircle2 } from 'lucide-react';

export default function AddReport() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadCat, setLoadCat] = useState(true);

  // Map location states
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');

  // Coordinate validation
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
          if (data?.length) setCategoryId(String(data[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message || 'Gagal memuat kategori.';
          setError(msg);
          showToast('error', msg);
        }
      } finally {
        if (!cancelled) setLoadCat(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleLocationSelected = ({ latitude: lat, longitude: lng, address: addr }) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
    setLocationError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi koordinat wajib
    if (latitude === null || longitude === null) {
      setLocationError(true);
      const msg = 'Titik koordinat lokasi wajib dipilih pada peta.';
      setError(msg);
      showToast('error', 'Silakan pilih lokasi kejadian pada peta terlebih dahulu.');
      document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('header', header);

      const finalBody = formatLocationForBody(body, latitude, longitude, address);
      formData.append('body', finalBody);
      formData.append('category_id', categoryId);
      if (image) {
        formData.append('image', image);
      }
      const data = await createReport(formData);
      showToast('success', 'Laporan Anda berhasil dikirim!');
      navigate(`/laporan/${data.id}`);
    } catch (err) {
      const payload = err.response?.data;
      const msg =
        payload?.message ||
        payload?.error ||
        err.message ||
        'Gagal mengirim laporan.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadCat) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/70 p-8 text-center text-xs font-medium text-slate-500 shadow-sm backdrop-blur-xl">
          Memuat formulir pengaduan...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Laporan</span>
        </Link>
      </div>

      <div className="rounded-[32px] border border-slate-200/90 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <MapPin size={13} className="text-emerald-600" />
          <span>Formulir Aspirasi Baru</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Buat Pengaduan Masyarakat
        </h1>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">
          Isi detail kejadian secara objektif dan tentukan titik koordinat di peta Leaflet di bawah ini.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[32px] border border-slate-200/90 bg-white/85 p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-5"
      >
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {categories.length === 0 ? (
          <p className="text-xs text-slate-500 font-normal">
            Kategori laporan belum tersedia di sistem.
          </p>
        ) : (
          <>
            {/* Judul Laporan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Judul Pengaduan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
                required
                maxLength={255}
                placeholder="Contoh: Lampu Penerangan Jalan Padam di RT 03"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Kategori Masalah <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-none transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Isi Laporan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Rincian Kronologi Kejadian <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                placeholder="Jelaskan secara ringkas: apa masalahnya, dampaknya bagi warga sekitar, dan sudah berapa lama terjadi..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none transition leading-relaxed"
              />
            </div>

            {/* MAP SELECTOR SECTION */}
            <div
              id="map-section"
              className={`pt-2 rounded-2xl transition duration-200 ${
                locationError ? 'ring-2 ring-rose-400/50 p-3 bg-rose-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <MapPin size={14} className={locationError ? 'text-rose-600' : 'text-emerald-600'} />
                  <span>Titik Lokasi Kejadian (Leaflet Map)</span>
                  <span className="text-rose-500">*</span>
                </div>

                {latitude && longitude ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Koordinat Terpilih
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-normal">
                    Belum Ditandai
                  </span>
                )}
              </div>

              {locationError && (
                <p className="mb-2 text-[11px] text-rose-600 font-medium">
                  Harap klik lokasi pada peta di bawah atau gunakan tombol GPS sebelum mengirim.
                </p>
              )}

              <MapSelector onLocationSelected={handleLocationSelected} />
            </div>

            {/* Gambar Lampiran */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-slate-700">
                Foto Bukti <span className="text-slate-400 font-normal">(opsional, JPG/PNG)</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImage(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setImagePreview(url);
                  } else {
                    setImagePreview('');
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-emerald-700 hover:file:bg-emerald-100 transition cursor-pointer"
              />

              {imagePreview && (
                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 w-full rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            {/* Tombol Kirim */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center rounded-full px-5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-xs font-medium text-white shadow-sm shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Mengirim Laporan...' : 'Kirim Pengaduan'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
