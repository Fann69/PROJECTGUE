import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lostItemsService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { MapPin, Calendar, User, ArrowLeft, Loader2, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function LostItemDetail() {
  const { id } = useParams();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await lostItemsService.getById(id);
        setItem(data);
      } catch (err) {
        toast.error('Laporan tidak ditemukan.');
        navigate('/items/lost');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Hapus Laporan?',
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
        await lostItemsService.delete(id);
        toast.success('Laporan berhasil dihapus.');
        navigate('/items/lost');
      } catch (err) {
        toast.error('Gagal menghapus laporan.');
      }
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

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <Link to="/items/lost" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali ke Daftar
      </Link>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Image */}
        {item.foto && (
          <div className="w-full aspect-video bg-muted">
            <img src={item.foto} alt={item.nama_barang} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="p-6 md:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-xs text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                {item.categories?.nama || 'Umum'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mt-3">{item.nama_barang}</h1>
            </div>
            {(isOwner || isAdmin) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  title="Hapus Laporan"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Lokasi Hilang</p>
                <p className="font-medium">{item.lokasi_hilang}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Hilang</p>
                <p className="font-medium">{new Date(item.tanggal_hilang).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Dilaporkan Oleh</p>
                <p className="font-medium">{item.profiles?.nama || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{item.profiles?.nim}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Deskripsi</h2>
            <p className="text-muted-foreground leading-relaxed">{item.deskripsi}</p>
          </div>

          {/* Contact */}
          {user && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm font-medium text-primary">Hubungi Pelapor</p>
              <p className="text-muted-foreground text-sm mt-1">
                WhatsApp: <span className="font-medium text-foreground">{item.profiles?.nomor_hp || 'Tidak tersedia'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
