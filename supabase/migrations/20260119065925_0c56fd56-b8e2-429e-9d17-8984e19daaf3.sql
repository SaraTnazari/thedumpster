-- Create enum for movie status
CREATE TYPE public.movie_status AS ENUM ('purgatory', 'verified');

-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  poster_url TEXT,
  release_year INTEGER,
  status movie_status NOT NULL DEFAULT 'purgatory',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  shittiness_score INTEGER NOT NULL CHECK (shittiness_score >= 1 AND shittiness_score <= 10),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create purgatory_votes table for tracking votes
CREATE TABLE public.purgatory_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purgatory_votes ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read, authenticated write)
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert movies" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update movies" ON public.movies FOR UPDATE TO authenticated USING (true);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Purgatory votes policies
CREATE POLICY "Anyone can view votes" ON public.purgatory_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.purgatory_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.purgatory_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.purgatory_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-verify movies with 5+ upvotes
CREATE OR REPLACE FUNCTION public.check_movie_verification()
RETURNS TRIGGER AS $$
DECLARE
  upvote_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO upvote_count 
  FROM public.purgatory_votes 
  WHERE movie_id = NEW.movie_id AND vote_type = 'up';
  
  IF upvote_count >= 5 THEN
    UPDATE public.movies SET status = 'verified' WHERE id = NEW.movie_id AND status = 'purgatory';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER check_verification_on_vote 
AFTER INSERT OR UPDATE ON public.purgatory_votes 
FOR EACH ROW EXECUTE FUNCTION public.check_movie_verification();