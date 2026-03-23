
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  region text NOT NULL DEFAULT 'bd',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (admin system)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, region)
  VALUES (NEW.id, NEW.email, 0, COALESCE(NEW.raw_user_meta_data->>'region', 'bd'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Packages table
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL DEFAULT 'bd',
  price integer NOT NULL,
  credit_cost integer NOT NULL,
  target_glory integer NOT NULL,
  glory_per_5min integer NOT NULL,
  bot_count integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bots table
CREATE TABLE public.bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid text NOT NULL UNIQUE,
  password text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage bots" ON public.bots FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  credit_amount integer NOT NULL,
  usage_limit integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expiry_date timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coupon redemptions
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON public.coupon_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Instances table
CREATE TABLE public.instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  guild_name text NOT NULL,
  guild_id text NOT NULL,
  region text NOT NULL,
  bot_count integer NOT NULL,
  status text NOT NULL DEFAULT 'running',
  target_glory integer NOT NULL,
  earned_glory integer NOT NULL DEFAULT 0,
  glory_per_5min integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own instances" ON public.instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own instances" ON public.instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own instances" ON public.instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage instances" ON public.instances FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- System logs
CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON public.system_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Seed default packages
INSERT INTO public.packages (name, region, price, credit_cost, target_glory, glory_per_5min, bot_count) VALUES
  ('Starter BD', 'bd', 50, 50, 1000, 50, 5),
  ('Pro BD', 'bd', 150, 150, 5000, 100, 15),
  ('Ultimate BD', 'bd', 350, 350, 15000, 200, 30),
  ('Starter IND', 'ind', 60, 60, 1200, 60, 5),
  ('Pro IND', 'ind', 180, 180, 6000, 120, 15),
  ('Ultimate IND', 'ind', 400, 400, 18000, 250, 35);

-- Function to redeem coupon (atomic)
CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text, _user_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _coupon record;
  _already_redeemed boolean;
BEGIN
  SELECT * INTO _coupon FROM public.coupons WHERE code = _code AND status = 'active';
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired coupon');
  END IF;
  IF _coupon.expiry_date IS NOT NULL AND _coupon.expiry_date < now() THEN
    RETURN json_build_object('success', false, 'error', 'Coupon has expired');
  END IF;
  IF _coupon.used_count >= _coupon.usage_limit THEN
    RETURN json_build_object('success', false, 'error', 'Coupon usage limit reached');
  END IF;
  SELECT EXISTS(SELECT 1 FROM coupon_redemptions WHERE coupon_id = _coupon.id AND user_id = _user_id) INTO _already_redeemed;
  IF _already_redeemed THEN
    RETURN json_build_object('success', false, 'error', 'You already used this coupon');
  END IF;
  UPDATE coupons SET used_count = used_count + 1 WHERE id = _coupon.id;
  INSERT INTO coupon_redemptions (coupon_id, user_id) VALUES (_coupon.id, _user_id);
  UPDATE profiles SET credits = credits + _coupon.credit_amount WHERE id = _user_id;
  RETURN json_build_object('success', true, 'credits_added', _coupon.credit_amount);
END;
$$;
