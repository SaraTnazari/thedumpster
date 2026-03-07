import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronRight, User, Star, Trash2, Skull, LogIn } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountdownCard } from "@/components/CountdownCard";
import { MovieCard } from "@/components/MovieCard";
import { MovieListItem } from "@/components/MovieListItem";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/image-utils";

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  status: "purgatory" | "verified";
}

interface RecentReview {
  id: string;
  movie_id: string;
  user_id: string;
  shittiness_score: number;
  review_text: string | null;
  created_at: string;
  movies: {
    title: string;
    poster_url: string | null;
  } | null;
}

const Index = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only fetch data if logged in
    if (isLoggedIn !== true) {
      setLoading(false);
      return;
    }

    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMovies(data || []);
      } catch (error: any) {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [isLoggedIn]);

  // Fetch recent reviews only when logged in
  useEffect(() => {
    if (isLoggedIn !== true) return;

    const fetchRecentReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, movie_id, user_id, shittiness_score, review_text, created_at, movies(title, poster_url)")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          return;
        }

        setRecentReviews(data || []);
      } catch (error: any) {
        // Error handling
      }
    };

    fetchRecentReviews();
  }, [isLoggedIn]);

  // Separate verified and purgatory movies
  const verifiedMovies = movies.filter((m) => m.status === "verified");
  const allMovies = movies;

  // Show landing page for non-logged-in users
  if (isLoggedIn === false) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 animate-pulse-glow"
          >
            <Skull className="w-12 h-12 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-gothic text-primary glow-pink">
              Dumpster
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm">
              The social app for rating the worst movies ever made.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 w-full max-w-xs"
          >
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 w-full px-8 py-4 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            >
              <LogIn className="w-5 h-5" />
              Sign In / Sign Up
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-4 pt-8"
          >
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="text-center">
                <Trash2 className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">Rate Trash</p>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">Write Reviews</p>
              </div>
              <div className="text-center">
                <Flame className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="text-xs">Earn Badges</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pb-32 space-y-8">
        {/* Profile Button Row */}
        <div className="flex justify-end -mb-4">
          <Link to="/profile" className="p-2 rounded-full bg-muted/60 hover:bg-muted transition-colors">
            <User className="w-5 h-5 text-primary" />
          </Link>
        </div>

        {/* Countdown Hero */}
        <CountdownCard />

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : movies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-xl font-display text-foreground">No trash found yet</h3>
              <p className="text-sm text-muted-foreground">
                Go add some!
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Top Trash Section */}
            {verifiedMovies.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-display text-foreground">Top Trash Right Now</h2>
                  </div>
                  <Link to="/leaderboard" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    See all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  {verifiedMovies.slice(0, 10).map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        posterUrl={movie.poster_url || undefined}
                        year={movie.release_year || undefined}
                        isVerified={movie.status === "verified"}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Fresh Trash Section */}
            {recentReviews.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-display text-foreground">Fresh Trash</h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  {recentReviews.map((review, index) => {
                    const posterUrl = getImageUrl(review.movies?.poster_url || null);
                    const rating = Math.round(review.shittiness_score / 2); // Convert 0-10 to 1-5

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => navigate(`/movie/${review.movie_id}`)}
                        className="flex-shrink-0 w-64 bg-card rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        {/* Poster and Title */}
                        <div className="flex gap-3 mb-3">
                          <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={review.movies?.title || "Movie"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl">🎬</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-foreground font-bold text-sm line-clamp-2 mb-2">
                              {review.movies?.title || "Unknown Movie"}
                            </h3>
                            {/* Trash Rating */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Trash2
                                  key={value}
                                  className={`w-4 h-4 ${
                                    value <= rating
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Review Text */}
                        {review.review_text && (
                          <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                            {review.review_text}
                          </p>
                        )}

                        {/* Score Badge */}
                        <p className="text-xs text-primary font-medium">
                          Score: {review.shittiness_score}/10
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Fresh Garbage Section */}
            {allMovies.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🗑️</span>
                  <h2 className="text-xl font-display text-foreground">Fresh Garbage</h2>
                </div>

                <div className="space-y-2">
                  {allMovies.slice(0, 10).map((movie, index) => (
                    <MovieListItem
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      posterUrl={movie.poster_url || undefined}
                      year={movie.release_year || undefined}
                      isVerified={movie.status === "verified"}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
