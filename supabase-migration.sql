-- ============================================
-- DUMPSTER: Follow System + Subscription Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 2. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'ended')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- 3. REVIEW DAILY LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.review_daily_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, review_date)
);

ALTER TABLE public.review_daily_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own limits" ON public.review_daily_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own limits" ON public.review_daily_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own limits" ON public.review_daily_limits FOR UPDATE USING (auth.uid() = user_id);

-- 4. BADGE UNLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.badge_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.badge_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.badge_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock badges" ON public.badge_unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. ADD COLUMNS TO PROFILES TABLE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_review_daily_limits_user_date ON public.review_daily_limits(user_id, review_date);
CREATE INDEX IF NOT EXISTS idx_badge_unlocks_user ON public.badge_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
