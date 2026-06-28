import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, UserPlus, User, Hash, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const registerSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  nim: z.string().regex(/^\d{8,}$/, 'NIM harus berupa angka minimal 8 digit'),
  email: z.string().email('Format email tidak valid'),
  nomor_hp: z.string().regex(/^\d{10,}$/, 'Nomor HP minimal 10 digit'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            nama: data.nama,
            nim: data.nim,
            email: data.email,
            nomor_hp: data.nomor_hp,
          }
        ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Akun terbuat tapi gagal menyimpan profil. Hubungi admin.');
        } else {
          toast.success('Pendaftaran berhasil! Silakan login.');
          navigate('/login');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg p-8 bg-card border border-border shadow-lg rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold">Daftar Akun Baru</h1>
          <p className="text-muted-foreground text-sm mt-2">Bergabung dengan komunitas peduli Polinela</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nama ? 'border-destructive' : 'border-input'}`}
                  {...register('nama')}
                />
              </div>
              {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">NIM / NIP</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="12345678" 
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nim ? 'border-destructive' : 'border-input'}`}
                  {...register('nim')}
                />
              </div>
              {errors.nim && <p className="text-xs text-destructive">{errors.nim.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="email" 
                placeholder="email@mhs.polinela.ac.id" 
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.email ? 'border-destructive' : 'border-input'}`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="081234567890" 
                className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nomor_hp ? 'border-destructive' : 'border-input'}`}
                {...register('nomor_hp')}
              />
            </div>
            {errors.nomor_hp && <p className="text-xs text-destructive">{errors.nomor_hp.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.password ? 'border-destructive' : 'border-input'}`}
                  {...register('password')}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.confirmPassword ? 'border-destructive' : 'border-input'}`}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-70 mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun? <Link to="/login" className="text-primary font-medium hover:underline">Masuk di sini</Link>
        </p>
      </motion.div>
    </div>
  );
}
