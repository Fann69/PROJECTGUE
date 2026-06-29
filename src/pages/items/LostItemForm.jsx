import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { lostItemsService, categoriesService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';

const lostItemSchema = z.object({
  nama_barang: z.string().min(3, 'Nama barang minimal 3 karakter'),
  category_id: z.string().min(1, 'Pilih kategori'),
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  lokasi_hilang: z.string().min(5, 'Lokasi minimal 5 karakter'),
  tanggal_hilang: z.string().min(1, 'Tanggal hilang wajib diisi'),
  foto: z
    .any()
    .optional()
    .refine((files) => !files?.[0] || files[0].size <= 2 * 1024 * 1024, 'Ukuran foto maksimal 2MB'),
});

export default function LostItemForm() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(lostItemSchema),
  });

  const fotoFiles = watch('foto');

  useEffect(() => {
    if (fotoFiles?.[0]) {
      const url = URL.createObjectURL(fotoFiles[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [fotoFiles]);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await categoriesService.getAll();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        nama_barang: data.nama_barang,
        category_id: data.category_id,
        deskripsi: data.deskripsi,
        lokasi_hilang: data.lokasi_hilang,
        tanggal_hilang: data.tanggal_hilang,
        status: 'pending',
      };
      await lostItemsService.create(payload, data.foto?.[0]);
      toast.success('Laporan berhasil dikirim! Menunggu verifikasi admin.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Gagal membuat laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <Link to="/items/lost" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali
      </Link>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-1">Laporan Barang Hilang</h1>
        <p className="text-muted-foreground text-sm mb-4">Isi form di bawah dengan detail yang akurat untuk mempercepat proses pencarian.</p>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6 text-sm text-amber-800 dark:text-amber-300">
          <span className="mt-0.5 flex-shrink-0">⏳</span>
          <p>Laporan Anda akan <strong>ditinjau oleh admin</strong> sebelum dipublikasikan. Anda akan mendapat notifikasi setelah disetujui.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Barang *</label>
            <input
              type="text"
              placeholder="Cth: Dompet Kulit Hitam"
              className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nama_barang ? 'border-destructive' : 'border-input'}`}
              {...register('nama_barang')}
            />
            {errors.nama_barang && <p className="text-xs text-destructive">{errors.nama_barang.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori *</label>
            <select
              className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.category_id ? 'border-destructive' : 'border-input'}`}
              {...register('category_id')}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nama}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lokasi Hilang *</label>
              <input
                type="text"
                placeholder="Cth: Gedung Kuliah Bersama Lt. 2"
                className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.lokasi_hilang ? 'border-destructive' : 'border-input'}`}
                {...register('lokasi_hilang')}
              />
              {errors.lokasi_hilang && <p className="text-xs text-destructive">{errors.lokasi_hilang.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Hilang *</label>
              <input
                type="date"
                className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.tanggal_hilang ? 'border-destructive' : 'border-input'}`}
                {...register('tanggal_hilang')}
              />
              {errors.tanggal_hilang && <p className="text-xs text-destructive">{errors.tanggal_hilang.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi Detail *</label>
            <textarea
              rows={4}
              placeholder="Jelaskan ciri-ciri khusus barang (warna, merek, isi, kondisi, dll)..."
              className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.deskripsi ? 'border-destructive' : 'border-input'}`}
              {...register('deskripsi')}
            />
            {errors.deskripsi && <p className="text-xs text-destructive">{errors.deskripsi.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Foto Barang (Opsional, Max 2MB)</label>
            {preview && (
              <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden mb-2">
                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
            <label className={`w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${errors.foto ? 'border-destructive' : 'border-input'}`}>
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Klik untuk pilih foto atau drag & drop</span>
              <input type="file" accept="image/*" className="hidden" {...register('foto')} />
            </label>
            {errors.foto && <p className="text-xs text-destructive">{errors.foto.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buat Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
