import { useState, useEffect } from 'react';
import { categoriesService } from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, Loader2, Tag, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const categorySchema = z.object({
  nama: z.string().min(2, 'Nama kategori minimal 2 karakter'),
  deskripsi: z.string().optional(),
});

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getAll();
      setCategories(data || []);
    } catch (err) {
      toast.error('Gagal memuat kategori.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setValue('nama', cat.nama);
    setValue('deskripsi', cat.deskripsi || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await categoriesService.update(editingId, data);
        toast.success('Kategori berhasil diperbarui!');
      } else {
        await categoriesService.create(data);
        toast.success('Kategori berhasil ditambahkan!');
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    const result = await Swal.fire({
      title: `Hapus Kategori "${nama}"?`,
      text: 'Barang yang terhubung ke kategori ini akan menjadi "Tanpa Kategori".',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(0, 84.2%, 60.2%)',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Hapus!',
    });

    if (result.isConfirmed) {
      try {
        await categoriesService.delete(id);
        toast.success('Kategori berhasil dihapus.');
        fetchCategories();
      } catch (err) {
        toast.error('Gagal menghapus kategori.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manajemen Kategori</h1>
          <p className="text-muted-foreground text-sm">{categories.length} kategori terdaftar</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Tambah Kategori
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-primary/20 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Kategori *</label>
              <input
                type="text"
                placeholder="Cth: Elektronik"
                className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nama ? 'border-destructive' : 'border-input'}`}
                {...register('nama')}
              />
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi (Opsional)</label>
              <input
                type="text"
                placeholder="Cth: HP, Laptop, Charger, dll"
                className="w-full px-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                {...register('deskripsi')}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleCancel} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                <X size={16} /> Batal
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check size={16} /> Simpan</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Kategori</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">Deskripsi</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary"><Tag size={14} /></div>
                      <span className="font-medium">{cat.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">{cat.deskripsi || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.nama)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">Belum ada kategori. Tambahkan sekarang!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
