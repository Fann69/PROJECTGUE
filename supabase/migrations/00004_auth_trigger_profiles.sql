-- 00004_auth_trigger_profiles.sql
-- Membuat trigger agar profile otomatis terbuat saat user sign up
-- Ini mengatasi masalah RLS ketika insert dari client-side tanpa session (misal email confirmation ON)

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, nim, email, nomor_hp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'Pengguna Baru'),
    COALESCE(NEW.raw_user_meta_data->>'nim', '-'),
    NEW.email,
    NEW.raw_user_meta_data->>'nomor_hp',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hapus trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger baru
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
