-- Pastikan ekstensi pgcrypto terinstall
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  user1_uid uuid := gen_random_uuid();
  user2_uid uuid := gen_random_uuid();
BEGIN
  -- ==========================================
  -- 1. INSERT AKUN USER PERTAMA (Budi Santoso)
  -- ==========================================
  
  -- Insert ke auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    user1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'budi@polinela.ac.id', crypt('user123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{"nama": "Budi Santoso"}', NOW(), NOW(),
    '', '', '', ''
  );

  -- Insert ke public.profiles
  INSERT INTO public.profiles (
    id, nama, nim, email, nomor_hp, role
  ) VALUES (
    user1_uid, 'Budi Santoso', '18712345', 'budi@polinela.ac.id', '081200001111', 'user'
  );


  -- ==========================================
  -- 2. INSERT AKUN USER KEDUA (Siti Aminah)
  -- ==========================================
  
  -- Insert ke auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    user2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'siti@polinela.ac.id', crypt('user123', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}', '{"nama": "Siti Aminah"}', NOW(), NOW(),
    '', '', '', ''
  );

  -- Insert ke public.profiles
  INSERT INTO public.profiles (
    id, nama, nim, email, nomor_hp, role
  ) VALUES (
    user2_uid, 'Siti Aminah', '18712346', 'siti@polinela.ac.id', '081200002222', 'user'
  );

END $$;
