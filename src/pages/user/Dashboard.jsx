import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useState } from 'react';
import { claimsService, lostItemsService, foundItemsService, notificationsService } from '../../services/api';
import { Package, Search, Clock, CheckCircle, Bell, BellOff, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { profile, user } = useAuthStore();
  const [stats, setStats] = useState({ myLost: 0, myFound: 0, myClaims: 0, approvedClaims: 0 });
  const [notifications, setNotifications] = useState([]);
  const [myLostItems, setMyLostItems] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingStats(true);
      try {
        const [lost, found, claims, notifs] = await Promise.all([
          lostItemsService.getMyItems(user.id),
          foundItemsService.getMyItems(user.id),
          claimsService.getMyClaims(user.id),
          notificationsService.getMine(user.id),
        ]);
        setStats({
          myLost: lost?.length || 0,
          myFound: found?.length || 0,
          myClaims: claims?.length || 0,
          approvedClaims: claims?.filter(c => c.status === 'approved').length || 0,
        });
        setMyLostItems(lost?.slice(0, 3) || []);
        setNotifications(notifs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationsService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('Semua notifikasi ditandai sudah dibaca.');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Selamat datang kembali, <span className="text-primary font-semibold">{profile?.nama || 'Pengguna'}</span>!</p>
        </div>
        <div className="flex gap-3">
          <Link to="/items/lost/new" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors">
            + Laporan Baru
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Laporan Hilang" value={loadingStats ? '...' : stats.myLost} icon={<Search className="w-5 h-5" />} color="text-destructive" />
        <StatCard title="Laporan Temuan" value={loadingStats ? '...' : stats.myFound} icon={<Package className="w-5 h-5" />} color="text-primary" />
        <StatCard title="Klaim Diajukan" value={loadingStats ? '...' : stats.myClaims} icon={<Clock className="w-5 h-5" />} color="text-amber-500" />
        <StatCard title="Klaim Disetujui" value={loadingStats ? '...' : stats.approvedClaims} icon={<CheckCircle className="w-5 h-5" />} color="text-green-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Lost Items */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold">Laporan Kehilangan Saya</h2>
            <Link to="/items/lost" className="text-sm text-primary hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>

          {myLostItems.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Search size={28} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada laporan kehilangan.</p>
              <Link to="/items/lost/new" className="mt-3 text-sm text-primary font-medium hover:underline">
                Buat Laporan Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myLostItems.map((item) => (
                <Link key={item.id} to={`/items/lost/${item.id}`} className="flex items-center gap-4 py-3 hover:text-primary transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.foto ? (
                      <img src={item.foto} alt={item.nama_barang} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Search size={16} className="text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-primary">{item.nama_barang}</p>
                    <p className="text-xs text-muted-foreground">{item.lokasi_hilang} · {new Date(item.tanggal_hilang).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.status === 'resolved' ? 'Selesai' : 'Aktif'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell size={18} />
              Notifikasi
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Tandai dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <BellOff size={28} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada notifikasi.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border text-sm transition-colors ${notif.is_read ? 'bg-background border-border text-muted-foreground' : 'bg-primary/5 border-primary/20 text-foreground'}`}
                >
                  <p className="font-medium">{notif.judul}</p>
                  <p className="text-xs mt-0.5 line-clamp-2">{notif.pesan}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full bg-background border border-border ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
