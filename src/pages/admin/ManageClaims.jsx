import { useState, useEffect } from 'react';
import { claimsService } from '../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: <Clock size={12} /> },
  approved: { label: 'Disetujui', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: <CheckCircle size={12} /> },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: <XCircle size={12} /> },
};

export default function ManageClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await claimsService.getAll();
      setClaims(data || []);
    } catch (err) {
      toast.error('Gagal memuat data klaim.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async (claimId, action, itemId, claimerId, itemName) => {
    const isApprove = action === 'approved';
    const result = await Swal.fire({
      title: isApprove ? 'Setujui Klaim?' : 'Tolak Klaim?',
      text: isApprove
        ? 'Klaim akan disetujui. Barang akan ditandai sebagai sudah diklaim dan penemu + pemohon akan diberitahu.'
        : 'Klaim akan ditolak dan pemohon akan diberitahu melalui notifikasi.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isApprove ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84.2%, 60.2%)',
      cancelButtonText: 'Batal',
      confirmButtonText: isApprove ? 'Ya, Setujui!' : 'Ya, Tolak!',
    });

    if (result.isConfirmed) {
      try {
        await claimsService.updateStatus(claimId, action, itemId, claimerId, itemName);
        toast.success(isApprove ? 'Klaim berhasil disetujui!' : 'Klaim ditolak.');
        fetchClaims();
      } catch (err) {
        toast.error('Gagal memperbarui klaim.');
      }
    }
  };

  const filteredClaims = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const pendingCount = claims.filter(c => c.status === 'pending').length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manajemen Klaim</h1>
          <p className="text-muted-foreground text-sm">
            {pendingCount > 0 && <span className="text-amber-500 font-medium">{pendingCount} klaim menunggu verifikasi · </span>}
            {claims.length} total klaim
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Menunggu' },
          { key: 'approved', label: 'Disetujui' },
          { key: 'rejected', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                ({claims.filter(c => tab.key === 'all' || c.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredClaims.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle size={32} className="text-green-500 mb-3" />
          <p className="text-muted-foreground">Tidak ada klaim dengan status ini.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClaims.map((claim) => {
            const sc = statusConfig[claim.status] || statusConfig.pending;
            return (
              <div key={claim.id} className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Claim Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          Klaim: <span className="text-primary">{claim.found_items?.nama_barang || 'Barang'}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Pemohon: <span className="font-medium text-foreground">{claim.profiles?.nama}</span>
                          {' · '}NIM: {claim.profiles?.nim}
                        </p>
                        <p className="text-xs text-muted-foreground">WA: {claim.profiles?.nomor_hp || '-'}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Alasan Klaim:</p>
                      <p className="text-sm">{claim.alasan}</p>
                    </div>

                    {claim.foto_bukti && (
                      <a
                        href={claim.foto_bukti}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <ExternalLink size={14} /> Lihat Foto Bukti
                      </a>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Diajukan: {new Date(claim.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Item Preview */}
                  <div className="md:w-32 md:flex-shrink-0">
                    {claim.found_items?.foto ? (
                      <img
                        src={claim.found_items.foto}
                        alt={claim.found_items.nama_barang}
                        className="w-full md:w-32 h-24 md:h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full md:w-32 h-24 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                        Tidak ada foto
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {claim.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleAction(claim.id, 'approved', claim.item_id, claim.user_id, claim.found_items?.nama_barang)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} /> Setujui Klaim
                    </button>
                    <button
                      onClick={() => handleAction(claim.id, 'rejected', null, claim.user_id, claim.found_items?.nama_barang)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                      <XCircle size={16} /> Tolak Klaim
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
