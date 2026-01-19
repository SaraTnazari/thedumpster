-- Fix security issues: Add ownership tracking and restrict public access

-- 1. Add created_by column to movies table for ownership tracking
ALTER TABLE public.movies ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Drop overly permissive policies on movies table
DROP POLICY IF EXISTS "Authenticated users can insert movies" ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can update movies" ON public.movies;

-- 3. Create proper ownership-based policies for movies
CREATE POLICY "Users can insert their own movies" 
ON public.movies FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own movies" 
ON public.movies FOR UPDATE TO authenticated 
USING (created_by = auth.uid());

-- 4. Restrict profiles table to authenticated users only (prevents anonymous enumeration)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- 5. Restrict purgatory_votes to authenticated users only (prevents tracking voting patterns)
DROP POLICY IF EXISTS "Anyone can view votes" ON public.purgatory_votes;

CREATE POLICY "Votes viewable by authenticated users" 
ON public.purgatory_votes FOR SELECT TO authenticated
USING (true);