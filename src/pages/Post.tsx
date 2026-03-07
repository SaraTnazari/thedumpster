import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Lock, Loader2, Calendar, X, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useReviewLimit } from "@/hooks/useReviewLimit";
import { ReviewLimitWarning } from "@/components/ReviewLimitWarning";
import { UpgradeModal } from "@/components/UpgradeModal";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
}

const Post = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState([5.0]);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { canReview, incrementCount } = useReviewLimit();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const apiKey = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
      if (!apiKey) {
        throw new Error("TMDB API key not configured");
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search movies");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search movies",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMovies(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMovies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
    setReviewOpen(true);
    setRating([5.0]);
    setReviewText("");
  };

  const handleSubmitReview = async () => {
    if (!selectedMovie) return;

    // Check daily review limit
    if (!canReview) {
      setShowUpgrade(true);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Check if movie already exists, otherwise insert it
      let movieId: string;

      // First, try to find existing movie by title
      const { data: existingMovie } = await supabase
        .from("movies")
        .select("*")
        .eq("title", selectedMovie.title)
        .maybeSingle();

      if (existingMovie) {
        movieId = existingMovie.id;
      } else {
        // Insert new movie
        const movieData: {
          title: string;
          release_year?: number | null;
          poster_url?: string | null;
        } = {
          title: selectedMovie.title,
        };

        if (selectedMovie.release_date) {
          const year = new Date(selectedMovie.release_date).getFullYear();
          if (!isNaN(year)) {
            movieData.release_year = year;
          }
        }

        // Save poster_path as-is (it's already a path like "/pB8BM7...")
        if (selectedMovie.poster_path) {
          movieData.poster_url = selectedMovie.poster_path;
        }

        const { data: movieResult, error: movieError } = await supabase
          .from("movies")
          .insert(movieData)
          .select()
          .single();

        if (movieError) throw movieError;
        if (!movieResult) {
          throw new Error("Failed to save movie");
        }

        movieId = movieResult.id;
      }

      // Step 2: Insert or update review in the reviews table
      const shittinessScore = Math.max(1, Math.min(10, Math.round(rating[0])));

      // Check if user already reviewed this movie
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("movie_id", movieId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existingReview) {
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            shittiness_score: shittinessScore,
            review_text: reviewText.trim() || null,
          })
          .eq("id", existingReview.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("reviews")
          .insert({
            user_id: session.user.id,
            movie_id: movieId,
            shittiness_score: shittinessScore,
            review_text: reviewText.trim() || null,
          });
        if (insertError) throw insertError;
      }

      // Increment daily review count
      await incrementCount();

      toast({
        title: "Review submitted!",
        description: `Your review for ${selectedMovie.title} has been saved.`,
      });

      setReviewOpen(false);
      setSelectedMovie(null);
      navigate(`/movie/${movieId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="pb-6 space-y-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="pb-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display text-foreground">Login Required</h3>
              <p className="text-sm text-muted-foreground">
                You need to sign in before you can add movies to Dumpster.
              </p>
              <Link
                to="/auth"
                className="inline-block px-8 py-3 gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const selectedMovieYear = selectedMovie?.release_date 
    ? new Date(selectedMovie.release_date).getFullYear()
    : null;
  const selectedMoviePosterUrl = selectedMovie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
    : null;

  return (
    <AppLayout>
      <div className="pb-6 space-y-6 flex flex-col">

        {/* Review Limit Warning */}
        <ReviewLimitWarning onUpgrade={() => setShowUpgrade(true)} />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-12 pl-10 bg-card border-border focus:border-primary rounded-xl"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((movie) => {
                const year = movie.release_date 
                  ? new Date(movie.release_date).getFullYear()
                  : null;
                const posterUrl = movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : null;

                return (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-card border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Poster */}
                      <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {posterUrl ? (
                          <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-foreground truncate">{movie.title}</h3>
                        {year && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{year}</span>
                          </div>
                        )}
                      </div>

                      {/* Review Button */}
                      <Button
                        onClick={() => handleMovieSelect(movie)}
                        className="gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
                      >
                        Review
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No movies found. Try a different search term.</p>
            </div>
          )}
        </motion.div>

        {/* Review Modal */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary glow-pink">
                Review This Trash
              </DialogTitle>
            </DialogHeader>

            {selectedMovie && (
              <div className="space-y-6 py-4">
                {/* Movie Info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {selectedMoviePosterUrl ? (
                      <img
                        src={selectedMoviePosterUrl}
                        alt={selectedMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-foreground text-lg">{selectedMovie.title}</h3>
                    {selectedMovieYear && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{selectedMovieYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Slider */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4" /> Shittiness Score
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={rating}
                      onValueChange={setRating}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">0.0</span>
                      <span className="text-primary font-display text-lg">
                        {rating[0].toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">10.0</span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Why is this trash?
                  </label>
                  <Textarea
                    placeholder="Tell us why this movie belongs in the dumpster..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-[120px] bg-muted border-border focus:border-primary rounded-xl resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full h-12 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Trash"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {showUpgrade && (
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      )}
    </AppLayout>
  );
};

export default Post;
