-- Pastikan ekstensi pgcrypto terinstall
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
BEGIN
  -- 1. Insert ke tabel auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    admin_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin2@polinela.ac.id',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"nama": "Super Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- 2. INSERT ke tabel public.profiles (karena kita tidak pakai trigger otomatis)
  INSERT INTO public.profiles (
    id,
    nama,
    nim,
    email,
    role
  ) VALUES (
    admin_uid,
    'Super Admin 2',
    'ADMIN002',
    'admin2@polinela.ac.id',
    'admin'
  );

END $$;
