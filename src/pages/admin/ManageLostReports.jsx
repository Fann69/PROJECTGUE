import { useState, useEffect } from 'react';
import { lostItemsService } from '../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  pending: {
    label: 'Menunggu',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    icon: <Clock size={12} />,
  },
  published: {
    label: 'Aktif',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    icon: <CheckCircle size={12} />,
  },
  resolved: {
    label: 'Selesai',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    label: 'Ditolak',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    icon: <XCircle size={12} />,
  },
};

export default function ManageLostReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await lostItemsService.getAll({ limit: 100 });
      setReports(data || []);
    } catch (err) {
      toast.error('Gagal memuat data laporan barang hilang.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId, newStatus, reporterName, itemName) => {
    const isApprove = newStatus === 'published';
    const isReject = newStatus === 'rejected';
    const isResolve = newStatus === 'resolved';

    let title, text, confirmText, confirmColor;

    if (isApprove) {
      title = 'Setujui Laporan?';
      text = `Laporan barang hilang "${itemName}" akan dipublikasikan dan dapat dilihat oleh semua pengguna.`;
      confirmText = 'Ya, Setujui!';
      confirmColor = 'hsl(142, 76%, 36%)';
    } else if (isReject) {
      title = 'Tolak Laporan?';
      text = `Laporan barang hilang "${itemName}" akan ditolak. Pelapor akan diberitahu melalui notifikasi.`;
      confirmText = 'Ya, Tolak!';
      confirmColor = 'hsl(0, 84.2%, 60.2%)';
    } else if (isResolve) {
      title = 'Tandai Selesai?';
      text = `Laporan barang hilang "${itemName}" akan ditandai sebagai selesai (barang sudah ditemukan).`;
      confirmText = 'Ya, Selesai!';
      confirmColor = 'hsl(217, 91%, 60%)';
    }

    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonText: 'Batal',
      confirmButtonText: confirmText,
    });

    if (result.isConfirmed) {
      try {
        await lostItemsService.updateStatus(reportId, newStatus, reporterName, itemName);
        toast.success(
          isApprove
            ? 'Laporan berhasil disetujui dan dipublikasikan!'
            : isReject
            ? 'Laporan telah ditolak.'
            : 'Laporan ditandai selesai.'
        );
        fetchReports();
      } catch (err) {
        toast.error('Gagal memperbarui status laporan.');
      }
    }
  };

  const filteredReports =
    filter === 'all' ? reports : reports.filter((r) => r.status === filter);

  const searched = filteredReports.filter((r) =>
    r.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manajemen Laporan Barang Hilang</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount > 0 && (
              <span className="text-amber-500 font-medium">
                {pendingCount} laporan menunggu verifikasi ·{' '}
              </span>
            )}
            {reports.length} total laporan
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Cari nama barang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Menunggu' },
          { key: 'published', label: 'Aktif' },
          { key: 'resolved', label: 'Selesai' },
          { key: 'rejected', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({reports.filter((r) => r.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : searched.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search size={32} className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Tidak ada laporan dengan filter ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {searched.map((report) => {
            const sc = statusConfig[report.status] || statusConfig.pending;
            return (
              <div
                key={report.id}
                className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Foto */}
                  <div className="md:w-32 md:flex-shrink-0">
                    {report.foto ? (
                      <img
                        src={report.foto}
                        alt={report.nama_barang}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full md:w-32 h-24 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                        Tidak ada foto
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground text-base">
                          {report.nama_barang}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          {report.categories?.nama || 'Umum'}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${sc.color}`}
                      >
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{report.deskripsi}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={13} className="text-primary flex-shrink-0" />
                        <span className="truncate">{report.lokasi_hilang}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={13} className="text-primary flex-shrink-0" />
                        <span>
                          {new Date(report.tanggal_hilang).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User size={13} className="text-primary flex-shrink-0" />
                        <span className="truncate">
                          {report.profiles?.nama || 'Unknown'} · {report.profiles?.nim}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Dilaporkan:{' '}
                      {new Date(report.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {report.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() =>
                        handleAction(
                          report.id,
                          'published',
                          report.profiles?.nama,
                          report.nama_barang
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} /> Setujui & Publikasikan
                    </button>
                    <button
                      onClick={() =>
                        handleAction(
                          report.id,
                          'rejected',
                          report.profiles?.nama,
                          report.nama_barang
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                      <XCircle size={16} /> Tolak Laporan
                    </button>
                  </div>
                )}

                {report.status === 'published' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() =>
                        handleAction(
                          report.id,
                          'resolved',
                          report.profiles?.nama,
                          report.nama_barang
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle size={16} /> Tandai Selesai
                    </button>
                    <button
                      onClick={() =>
                        handleAction(
                          report.id,
                          'rejected',
                          report.profiles?.nama,
                          report.nama_barang
                        )
                      }
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border border-destructive/40 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10 transition-colors"
                    >
                      <XCircle size={16} /> Nonaktifkan
                    </button>
                  </div>
                )}

                {/* View Detail Link */}
                <div className="mt-3">
                  <Link
                    to={`/items/lost/${report.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Lihat detail laporan →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
