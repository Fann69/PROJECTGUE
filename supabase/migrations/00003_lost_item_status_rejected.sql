-- 00003_lost_item_status_rejected.sql
-- Tambahkan nilai 'rejected' ke enum lost_item_status
-- dan ubah default status lost_items menjadi 'pending' (wajib approve admin)

-- 1. Tambahkan nilai baru ke enum
ALTER TYPE lost_item_status ADD VALUE IF NOT EXISTS 'rejected';

-- 2. Ubah default kolom status di tabel lost_items menjadi 'pending'
ALTER TABLE public.lost_items
  ALTER COLUMN status SET DEFAULT 'pending'::lost_item_status;

-- Catatan: Jalankan migration ini di Supabase SQL Editor.
-- Data lama tidak terpengaruh (tetap statusnya masing-masing).
