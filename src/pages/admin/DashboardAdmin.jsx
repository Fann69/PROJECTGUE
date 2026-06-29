import { useEffect, useState } from 'react';
import { statsService, claimsService, activityLogsService } from '../../services/api';
import { Users, Package, Search, ShieldCheck, Loader2, CheckCircle, XCircle, Clock, Activity, FileSearch } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardAdmin() {
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, totalClaims: 0, totalUsers: 0 });
  const [pendingClaims, setPendingClaims] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, claims, logs] = await Promise.all([
        statsService.getAdminStats(),
        claimsService.getAll(),
        activityLogsService.getAll(),
      ]);
      setStats(statsData);
      setPendingClaims(claims.filter(c => c.status === 'pending'));
      setActivityLogs(logs.slice(0, 10));
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimAction = async (claimId, action, itemId, claimerId, itemName) => {
    const isApprove = action === 'approved';
    const result = await Swal.fire({
      title: isApprove ? 'Setujui Klaim?' : 'Tolak Klaim?',
      text: isApprove ? 'Barang akan ditandai sebagai sudah diklaim.' : 'Klaim akan ditolak dan pemohon akan diberitahu.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isApprove ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84.2%, 60.2%)',
      cancelButtonText: 'Batal',
      confirmButtonText: isApprove ? 'Ya, Setujui!' : 'Ya, Tolak!',
    });

    if (result.isConfirmed) {
      try {
        await claimsService.updateStatus(claimId, action, itemId, claimerId, itemName);
        toast.success(isApprove ? 'Klaim berhasil disetujui!' : 'Klaim telah ditolak.');
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error('Gagal memperbarui klaim: ' + (err.message || ''));
      }
    }
  };

  const barChartData = {
    labels: ['Barang Hilang', 'Barang Ditemukan', 'Total Klaim', 'Total User'],
    datasets: [{
      label: 'Statistik Sistem',
      data: [stats.totalLost, stats.totalFound, stats.totalClaims, stats.totalUsers],
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(34,197,94,0.7)', 'rgba(245,158,11,0.7)', 'rgba(168,85,247,0.7)'],
      borderRadius: 8,
    }],
  };

  const barChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">Pantau dan kelola seluruh aktivitas sistem.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Total Hilang" value={stats.totalLost} icon={<Search className="w-5 h-5" />} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" to="/admin/lost-reports" />
        <AdminStatCard title="Total Ditemukan" value={stats.totalFound} icon={<Package className="w-5 h-5" />} color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" to="/admin/found-reports" />
        <AdminStatCard title="Total Klaim" value={stats.totalClaims} icon={<ShieldCheck className="w-5 h-5" />} color="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" to="/admin/claims" />
        <AdminStatCard title="Total User" value={stats.totalUsers} icon={<Users className="w-5 h-5" />} color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" to="/admin/users" />
      </div>

      {/* Chart & Pending Claims */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5">Statistik Keseluruhan</h2>
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Klaim Menunggu
              {pendingClaims.length > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingClaims.length}</span>
              )}
            </h2>
            <Link to="/admin/claims" className="text-xs text-primary hover:underline">Semua Klaim</Link>
          </div>

          {pendingClaims.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle size={28} className="text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada klaim menunggu verifikasi.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="p-3 bg-background border border-border rounded-lg">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <p className="font-medium text-sm">{claim.found_items?.nama_barang || 'Barang'}</p>
                      <p className="text-xs text-muted-foreground">Oleh: {claim.profiles?.nama}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{claim.alasan}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaimAction(claim.id, 'approved', claim.item_id, claim.user_id, claim.found_items?.nama_barang)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} /> Setujui
                    </button>
                    <button
                      onClick={() => handleClaimAction(claim.id, 'rejected', null, claim.user_id, claim.found_items?.nama_barang)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <XCircle size={14} /> Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link to="/admin/lost-reports" className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500"><FileSearch size={20} /></div>
          <div>
            <p className="font-semibold">Barang Hilang</p>
            <p className="text-xs text-muted-foreground">Approve laporan barang hilang</p>
          </div>
        </Link>
        <Link to="/admin/categories" className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary"><Package size={20} /></div>
          <div>
            <p className="font-semibold">Kategori</p>
            <p className="text-xs text-muted-foreground">Kelola kategori barang</p>
          </div>
        </Link>
        <Link to="/admin/claims" className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500"><ShieldCheck size={20} /></div>
          <div>
            <p className="font-semibold">Klaim</p>
            <p className="text-xs text-muted-foreground">Verifikasi semua klaim</p>
          </div>
        </Link>
        <Link to="/admin/users" className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500"><Users size={20} /></div>
          <div>
            <p className="font-semibold">Pengguna</p>
            <p className="text-xs text-muted-foreground">Manajemen akun user</p>
          </div>
        </Link>
      </div>

      {/* Activity Log */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <Activity size={18} /> Log Aktivitas Terbaru
        </h2>
        {activityLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada log aktivitas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Pengguna</th>
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Aktivitas</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 pr-4">{log.profiles?.nama || 'System'}</td>
                    <td className="py-2.5 pr-4">{log.activity}</td>
                    <td className="py-2.5 text-muted-foreground">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon, color, to }) {
  const content = (
    <>
      <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </>
  );

  const className = "bg-card border border-border rounded-xl shadow-sm p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all";

  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}
