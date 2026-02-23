-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT comments_movie_id_fkey FOREIGN KEY (movie_id)
    REFERENCES movies(id) ON DELETE CASCADE,
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT comments_content_max_length CHECK (char_length(content) <= 1000)
);

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "Allow public read access to comments"
  ON comments FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert comments (where user_id matches their auth.uid())
CREATE POLICY "Allow authenticated users to insert their own comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Allow users to update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Allow users to delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create index on movie_id for fast lookups
CREATE INDEX IF NOT EXISTS comments_movie_id_idx ON comments(movie_id);

-- Create index on user_id for querying user's comments
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

-- Create index on created_at for ordering by most recent
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
