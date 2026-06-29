import { supabase } from '../lib/supabase';

// ============ ACTIVITY LOGS (harus di atas agar bisa dipakai service lain) ============
export const activityLogsService = {
  log: async (userId, activity) => {
    // Tidak throw error agar tidak mengganggu flow utama
    try {
      await supabase.from('activity_logs').insert([{ user_id: userId, activity }]);
    } catch (_) {}
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, profiles(nama)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  },
};

// Helper: sanitize nama file agar aman di storage
const sanitizeFileName = (name) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();

// ============ LOST ITEMS ============
export const lostItemsService = {
  getAll: async ({ search = '', categoryId = '', page = 1, limit = 9 } = {}) => {
    let query = supabase
      .from('lost_items')
      .select('*, profiles(nama, nim), categories(nama)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.ilike('nama_barang', `%${search}%`);
    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*, profiles(nama, nim, nomor_hp, foto), categories(nama)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  getMyItems: async (userId) => {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*, categories(nama)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (payload, fotoFile) => {
    let fotoUrl = null;
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${sanitizeFileName(fotoFile.name.replace(`.${ext}`, ''))}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('item_images')
        .upload(fileName, fotoFile, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('item_images').getPublicUrl(fileName);
      fotoUrl = urlData.publicUrl;
    }
    const { data, error } = await supabase
      .from('lost_items')
      .insert([{ ...payload, foto: fotoUrl }])
      .select()
      .single();
    if (error) throw error;

    await activityLogsService.log(payload.user_id, `Melaporkan barang hilang: ${payload.nama_barang}`);

    return data;
  },

  update: async (id, payload) => {
    const { data, error } = await supabase.from('lost_items').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  updateStatus: async (id, status, reporterName = '', itemName = 'Barang') => {
    const { data, error } = await supabase
      .from('lost_items')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Ambil user_id pelapor untuk notifikasi
    const { data: itemData } = await supabase
      .from('lost_items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (itemData?.user_id) {
      let judul = '';
      let pesan = '';
      if (status === 'published') {
        judul = 'Laporan Disetujui';
        pesan = `Laporan barang hilang Anda "${itemName}" telah disetujui dan dipublikasikan oleh admin.`;
      } else if (status === 'rejected') {
        judul = 'Laporan Ditolak';
        pesan = `Maaf, laporan barang hilang Anda "${itemName}" ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut.`;
      } else if (status === 'resolved') {
        judul = 'Laporan Selesai';
        pesan = `Laporan barang hilang Anda "${itemName}" telah ditandai selesai oleh admin.`;
      }
      if (judul) {
        await supabase.from('notifications').insert([{ user_id: itemData.user_id, judul, pesan }]);
      }
    }

    // Catat log aktivitas Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await activityLogsService.log(user.id, `Memverifikasi laporan barang hilang "${itemName}" menjadi: ${status}`);
    }

    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('lost_items').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============ FOUND ITEMS ============
export const foundItemsService = {
  getAll: async ({ search = '', categoryId = '', page = 1, limit = 9 } = {}) => {
    let query = supabase
      .from('found_items')
      .select('*, profiles(nama, nim), categories(nama)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.ilike('nama_barang', `%${search}%`);
    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('found_items')
      .select('*, profiles(nama, nim, nomor_hp, foto), categories(nama)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  getMyItems: async (userId) => {
    const { data, error } = await supabase
      .from('found_items')
      .select('*, categories(nama)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (payload, fotoFile) => {
    let fotoUrl = null;
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${sanitizeFileName(fotoFile.name.replace(`.${ext}`, ''))}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('item_images')
        .upload(fileName, fotoFile, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('item_images').getPublicUrl(fileName);
      fotoUrl = urlData.publicUrl;
    }
    const { data, error } = await supabase
      .from('found_items')
      .insert([{ ...payload, foto: fotoUrl }])
      .select()
      .single();
    if (error) throw error;

    await activityLogsService.log(payload.user_id, `Melaporkan barang temuan: ${payload.nama_barang}`);

    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('found_items').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============ CATEGORIES ============
export const categoriesService = {
  getAll: async () => {
    const { data, error } = await supabase.from('categories').select('*').order('nama');
    if (error) throw error;
    return data;
  },

  create: async (payload) => {
    const { data, error } = await supabase.from('categories').insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  update: async (id, payload) => {
    const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============ CLAIMS ============
export const claimsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('claims')
      .select('*, profiles(nama, nim, nomor_hp), found_items(nama_barang, foto)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getMyClaims: async (userId) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*, found_items(nama_barang, foto, lokasi_ditemukan)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  create: async (payload, buktiFotoFile) => {
    // Upload foto bukti (wajib — kolom NOT NULL di DB)
    if (!buktiFotoFile) {
      throw new Error('Foto bukti kepemilikan wajib diupload.');
    }

    const ext = buktiFotoFile.name.split('.').pop();
    const safeName = sanitizeFileName(buktiFotoFile.name.replace(`.${ext}`, ''));
    const fileName = `${Date.now()}_${safeName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('claim_proofs')
      .upload(fileName, buktiFotoFile, { upsert: false });
    if (uploadError) throw new Error(`Upload gagal: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('claim_proofs').getPublicUrl(fileName);
    const fotoUrl = urlData.publicUrl;

    const { data, error } = await supabase
      .from('claims')
      .insert([{ ...payload, foto_bukti: fotoUrl }])
      .select()
      .single();
    if (error) throw error;

    await activityLogsService.log(payload.user_id, 'Mengajukan klaim kepemilikan barang');

    return data;
  },

  updateStatus: async (id, status, itemId = null, claimerId = null, itemName = 'Barang') => {
    const { data, error } = await supabase
      .from('claims')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Notifikasi untuk pemohon (claimer)
    if (claimerId) {
      await supabase.from('notifications').insert([{
        user_id: claimerId,
        judul: status === 'approved' ? 'Klaim Disetujui' : 'Klaim Ditolak',
        pesan: status === 'approved'
          ? `Klaim Anda untuk barang "${itemName}" telah disetujui admin. Silakan ambil barang Anda.`
          : `Maaf, klaim Anda untuk barang "${itemName}" ditolak karena bukti tidak valid.`,
      }]);
    }

    // Jika disetujui, update status barang di found_items
    if (status === 'approved' && itemId) {
      await supabase.from('found_items').update({ status: 'claimed' }).eq('id', itemId);

      // Notifikasi ke penemu barang
      const { data: itemData } = await supabase.from('found_items').select('user_id').eq('id', itemId).single();
      if (itemData?.user_id) {
        await supabase.from('notifications').insert([{
          user_id: itemData.user_id,
          judul: 'Barang Temuan Diklaim',
          pesan: `Barang "${itemName}" yang Anda temukan telah diklaim dan disetujui oleh admin.`,
        }]);
      }
    }

    // Catat log aktivitas Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await activityLogsService.log(user.id, `Memverifikasi klaim barang "${itemName}" menjadi: ${status}`);
    }

    return data;
  },
};

// ============ NOTIFICATIONS ============
export const notificationsService = {
  getMine: async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data;
  },

  markAsRead: async (id) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  markAllAsRead: async (userId) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    if (error) throw error;
  },
};

// ============ DASHBOARD STATS ============
export const statsService = {
  getAdminStats: async () => {
    const [lost, found, claims, users] = await Promise.all([
      supabase.from('lost_items').select('id', { count: 'exact', head: true }),
      supabase.from('found_items').select('id', { count: 'exact', head: true }),
      supabase.from('claims').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    return {
      totalLost: lost.count || 0,
      totalFound: found.count || 0,
      totalClaims: claims.count || 0,
      totalUsers: users.count || 0,
    };
  },
};
