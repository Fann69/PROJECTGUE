import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { foundItemsService, claimsService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Calendar, User, ArrowLeft, Loader2, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const claimSchema = z.object({
  alasan: z.string().min(20, 'Jelaskan alasan klaim minimal 20 karakter (ciri spesifik barang)'),
  foto_bukti: z
    .any()
    .refine((files) => files?.[0], 'Foto bukti kepemilikan wajib diupload')
    .refine((files) => files?.[0]?.size <= 2 * 1024 * 1024, 'Ukuran file maksimal 2MB'),
});

export default function FoundItemDetail() {
  const { id } = useParams();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(claimSchema),
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await foundItemsService.getById(id);
        setItem(data);
      } catch (err) {
        toast.error('Barang tidak ditemukan.');
        navigate('/items/found');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Hapus Laporan Temuan?',
      text: 'Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(0, 84.2%, 60.2%)',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus!',
      background: 'hsl(var(--card))',
      color: 'hsl(var(--foreground))',
    });

    if (result.isConfirmed) {
      try {
        await foundItemsService.delete(id);
        toast.success('Laporan berhasil dihapus.');
        navigate('/items/found');
      } catch (err) {
        toast.error('Gagal menghapus laporan.');
      }
    }
  };

  const onClaimSubmit = async (data) => {
    setClaiming(true);
    try {
      await claimsService.create(
        { user_id: user.id, item_id: id, alasan: data.alasan },
        data.foto_bukti[0]
      );
      toast.success('Klaim berhasil diajukan! Admin akan memverifikasi bukti Anda.');
      setShowClaimForm(false);
      reset();
    } catch (err) {
      toast.error(err.message || 'Gagal mengajukan klaim.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user?.id === item.user_id;
  const isAdmin = profile?.role === 'admin';
  const canClaim = user && !isOwner && item.status === 'published';

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Link to="/items/found" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali ke Daftar Temuan
      </Link>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {item.foto && (
          <div className="w-full aspect-video bg-muted">
            <img src={item.foto} alt={item.nama_barang} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                {item.categories?.nama || 'Umum'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mt-3">{item.nama_barang}</h1>
              <span className={`mt-2 inline-block text-xs font-medium px-2.5 py-1 rounded-full ${item.status === 'claimed' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {item.status === 'claimed' ? 'Sudah Diklaim' : 'Menunggu Pemilik'}
              </span>
            </div>
            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} className="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors" title="Hapus">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Lokasi Ditemukan</p>
                <p className="font-medium">{item.lokasi_ditemukan}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Ditemukan</p>
                <p className="font-medium">{new Date(item.tanggal_ditemukan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Ditemukan Oleh</p>
                <p className="font-medium">{item.profiles?.nama || 'Anonymous'}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Deskripsi Barang</h2>
            <p className="text-muted-foreground leading-relaxed">{item.deskripsi}</p>
          </div>

          {/* Claim Section */}
          {canClaim && !showClaimForm && (
            <button
              onClick={() => setShowClaimForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <ShieldCheck size={20} /> Ajukan Klaim Ini Milik Saya
            </button>
          )}

          {!user && (
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground text-sm">
                <Link to="/login" className="text-primary font-medium hover:underline">Login</Link> untuk mengajukan klaim barang ini.
              </p>
            </div>
          )}

          {/* Claim Form */}
          {showClaimForm && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> Form Pengajuan Klaim
              </h3>
              <p className="text-sm text-muted-foreground mb-5">Jelaskan ciri-ciri spesifik barang yang hanya pemilik asli yang tahu, dan lampirkan foto bukti kepemilikan.</p>

              <form onSubmit={handleSubmit(onClaimSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alasan & Ciri Khas Barang *</label>
                  <textarea
                    rows={4}
                    placeholder="Contoh: Dompet hitam merk FOSSIL, di dalamnya ada KTM atas nama saya, foto berdua dan kartu ATM Bank Mandiri..."
                    className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.alasan ? 'border-destructive' : 'border-input'}`}
                    {...register('alasan')}
                  />
                  {errors.alasan && <p className="text-xs text-destructive">{errors.alasan.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto Bukti Kepemilikan * (Max 2MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer border rounded-lg px-2 py-1.5 ${errors.foto_bukti ? 'border-destructive' : 'border-input'}`}
                    {...register('foto_bukti')}
                  />
                  {errors.foto_bukti && <p className="text-xs text-destructive">{errors.foto_bukti.message}</p>}
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowClaimForm(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={claiming} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
                    {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Klaim'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
