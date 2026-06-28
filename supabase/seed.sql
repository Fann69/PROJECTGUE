-- seed.sql

-- Insert default categories
INSERT INTO public.categories (nama, deskripsi) VALUES
('Elektronik', 'HP, Laptop, Charger, Earphone, dll'),
('Dokumen & Identitas', 'KTP, KTM, SIM, STNK, Paspor, dll'),
('Dompet & Uang', 'Dompet, Uang tunai, Kartu ATM, dll'),
('Kunci', 'Kunci motor, Kunci rumah, Kunci loker, dll'),
('Pakaian & Aksesoris', 'Jaket, Topi, Helm, Jam tangan, dll'),
('Buku & Alat Tulis', 'Buku catatan, Pensil, Pulpen, Kotak pensil, dll'),
('Lainnya', 'Barang yang tidak termasuk kategori lain')
ON CONFLICT (nama) DO NOTHING;

-- Note: Inserting an admin user requires inserting into `auth.users` first.
-- In a real Supabase environment, it's recommended to create the admin user 
-- via the Supabase Auth UI or API, and then update their role in the `public.profiles` table:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@polinela.ac.id';
