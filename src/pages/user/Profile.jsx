import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, User, Mail, Phone, Hash, Camera } from 'lucide-react';

const profileSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  nomor_hp: z.string().regex(/^\d{10,}$/, 'Nomor HP minimal 10 digit'),
});

export default function Profile() {
  const { profile, fetchProfile, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({ nama: profile.nama, nomor_hp: profile.nomor_hp });
    }
  }, [profile, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error('Ukuran foto profil maksimal 1MB.');
        return;
      }
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let fotoUrl = profile?.foto || null;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        fotoUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ nama: data.nama, nomor_hp: data.nomor_hp, foto: fotoUrl })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground text-sm">Kelola informasi profil Anda</p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
              {(avatarPreview || profile?.foto) ? (
                <img src={avatarPreview || profile.foto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={36} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Klik ikon kamera untuk ganti foto (Max 1MB)</p>
        </div>

        {/* Read-only Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Hash size={16} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">NIM/NIP</p>
              <p className="font-medium">{profile?.nim || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nama ? 'border-destructive' : 'border-input'}`}
                {...register('nama')}
              />
            </div>
            {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.nomor_hp ? 'border-destructive' : 'border-input'}`}
                {...register('nomor_hp')}
              />
            </div>
            {errors.nomor_hp && <p className="text-xs text-destructive">{errors.nomor_hp.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
