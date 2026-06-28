import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { lostItemsService, categoriesService } from '../../services/api';
import { Search, Plus, Filter, MapPin, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

function ItemCard({ item, type }) {
  const statusColors = {
    published: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    claimed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  const statusLabels = { published: 'Aktif', resolved: 'Selesai', claimed: 'Diklaim' };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="aspect-video bg-muted overflow-hidden relative">
        {item.foto ? (
          <img
            src={item.foto}
            alt={item.nama_barang}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Tidak ada foto
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[item.status] || statusColors.published}`}>
          {statusLabels[item.status] || item.status}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-primary font-medium mb-1">{item.categories?.nama || 'Umum'}</p>
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.nama_barang}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">{item.deskripsi}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <MapPin size={12} />
          <span className="truncate">{type === 'lost' ? item.lokasi_hilang : item.lokasi_ditemukan}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar size={12} />
          <span>{new Date(type === 'lost' ? item.tanggal_hilang : item.tanggal_ditemukan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <Link
          to={`/items/${type}/${item.id}`}
          className="mt-4 block w-full text-center text-sm font-medium py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Lihat Detail
        </Link>
      </div>
    </motion.div>
  );
}

export default function LostItems() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 9;

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await categoriesService.getAll();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, count } = await lostItemsService.getAll({ search, categoryId, page, limit });
        setItems(data || []);
        setTotal(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [search, categoryId, page]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barang Hilang</h1>
          <p className="text-muted-foreground mt-1">{total} laporan ditemukan</p>
        </div>
        {user && (
          <Link
            to="/items/lost/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={18} /> Laporkan Kehilangan
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            defaultValue={search}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
            onBlur={(e) => updateParam('search', e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <select
            value={categoryId}
            onChange={(e) => updateParam('category', e.target.value)}
            className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <Search size={28} />
          </div>
          <p className="text-muted-foreground">Tidak ada laporan yang cocok dengan pencarian Anda.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} type="lost" />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => updateParam('page', String(page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-muted-foreground px-2">
            Halaman {page} dari {totalPages}
          </span>
          <button
            onClick={() => updateParam('page', String(page + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
