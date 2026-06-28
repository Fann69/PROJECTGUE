import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Users, ArrowLeft, Search, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      toast.error('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, nama, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const result = await Swal.fire({
      title: `Ubah Role?`,
      text: `Anda yakin ingin mengubah role ${nama} menjadi ${newRole.toUpperCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'hsl(221.2, 83.2%, 53.3%)',
      cancelButtonText: 'Batal',
      confirmButtonText: 'Ya, Ubah',
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
          
        if (error) throw error;
        toast.success(`Role ${nama} berhasil diubah menjadi ${newRole}`);
        fetchUsers();
      } catch (err) {
        toast.error('Gagal mengubah role pengguna.');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground text-sm">Kelola role dan data seluruh pengguna sistem</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIM, atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-md pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Profil</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">NIM/NIP</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Kontak</th>
                  <th className="text-left px-6 py-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-right px-6 py-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex flex-shrink-0 items-center justify-center text-primary">
                          {user.foto ? (
                            <img src={user.foto} alt={user.nama} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.nama}</p>
                          <p className="text-xs text-muted-foreground">Terdaftar: {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{user.nim}</td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.nomor_hp || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' && <ShieldCheck size={14} />}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRoleChange(user.id, user.nama, user.role)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {user.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      Tidak ada pengguna yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
