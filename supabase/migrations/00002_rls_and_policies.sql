-- 00002_rls_and_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Utility function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles Policies
-- Public can read basic profile info (needed for displaying reporter names)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Users can only update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Categories Policies
-- Everyone can read categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
-- Only admins can modify categories
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.get_user_role() = 'admin');
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.get_user_role() = 'admin');

-- 3. Lost Items Policies
-- Everyone can read published lost items
CREATE POLICY "Lost items are viewable by everyone" ON public.lost_items FOR SELECT USING (true);
-- Authenticated users can insert
CREATE POLICY "Authenticated users can create lost items" ON public.lost_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Users can update/delete their own lost items, admins can update/delete any
CREATE POLICY "Users can update own lost items, admins can update all" ON public.lost_items FOR UPDATE USING (auth.uid() = user_id OR public.get_user_role() = 'admin');
CREATE POLICY "Users can delete own lost items, admins can delete all" ON public.lost_items FOR DELETE USING (auth.uid() = user_id OR public.get_user_role() = 'admin');

-- 4. Found Items Policies
-- Everyone can read published found items
CREATE POLICY "Found items are viewable by everyone" ON public.found_items FOR SELECT USING (true);
-- Authenticated users can insert
CREATE POLICY "Authenticated users can create found items" ON public.found_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Users can update/delete their own found items, admins can update/delete any
CREATE POLICY "Users can update own found items, admins can update all" ON public.found_items FOR UPDATE USING (auth.uid() = user_id OR public.get_user_role() = 'admin');
CREATE POLICY "Users can delete own found items, admins can delete all" ON public.found_items FOR DELETE USING (auth.uid() = user_id OR public.get_user_role() = 'admin');

-- 5. Claims Policies
-- Users can read their own claims, admins can read all
CREATE POLICY "Users can view own claims, admins view all" ON public.claims FOR SELECT USING (auth.uid() = user_id OR public.get_user_role() = 'admin');
-- Users can insert claims
CREATE POLICY "Authenticated users can create claims" ON public.claims FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Only admins can update claims (e.g. changing status)
CREATE POLICY "Only admins can update claims" ON public.claims FOR UPDATE USING (public.get_user_role() = 'admin');

-- 6. Notifications Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
-- Users can update their own notifications (e.g. marking as read)
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
-- Authenticated users (like admins via system actions) can insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Activity Logs Policies
-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs FOR SELECT USING (public.get_user_role() = 'admin');
-- System inserts logs (bypass RLS for insert via SECURITY DEFINER function or trust)
CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);


-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lost_items_updated_at BEFORE UPDATE ON public.lost_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_found_items_updated_at BEFORE UPDATE ON public.found_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage Buckets setup documentation:
-- You need to create the following buckets manually or using SQL if superuser:
-- 1. `avatars` (Public)
-- 2. `item_images` (Public)
-- 3. `claim_proofs` (Private)
