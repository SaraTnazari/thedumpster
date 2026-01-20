-- Fix profiles table to require authentication for viewing
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Add DELETE policy for movies table to allow users to delete their own submissions
CREATE POLICY "Users can delete their own movies"
ON public.movies
FOR DELETE
USING (created_by = auth.uid());