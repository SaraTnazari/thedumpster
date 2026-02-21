import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronRight, User, Star, Trash2, Settings } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountdownCard } from "@/components/CountdownCard";
import { MovieCard } from "@/components/MovieCard";
import { MovieListItem } from "@/components/MovieListItem";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

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
  movie_title: string | null;
  poster_path: string | null;
  shittiness_score: number;
  review_text: string | null;
  user_name: string | null;
  is_vip: boolean | null;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMovies(data || []);
      } catch (error: any) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Fetch recent reviews
  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching recent reviews:", error);
          return;
        }

        setRecentReviews(data || []);
      } catch (error: any) {
        console.error("Error fetching recent reviews:", error);
      }
    };

    fetchRecentReviews();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) {
      return url;
    }
    return `https://image.tmdb.org/t/p/w500${url}`;
  };

  // Separate verified and purgatory movies
  const verifiedMovies = movies.filter((m) => m.status === "verified");
  const allMovies = movies;

  return (
    <AppLayout>
      {/* Header Buttons */}
      <div className="fixed top-0 right-0 z-50 p-4 pt-safe flex items-center gap-2">
        <Link to="/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Settings className="w-6 h-6 text-white" />
        </Link>
        <Link to="/profile" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <User className="w-6 h-6 text-primary" />
        </Link>
      </div>

      <div className="pb-32 space-y-8 pt-safe" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}>
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
                    const posterUrl = getImageUrl(review.poster_path);
                    const rating = Math.round(review.shittiness_score / 2); // Convert 0-10 to 1-5
                    
                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => navigate(`/movie/${review.movie_id}`)}
                        className={`flex-shrink-0 w-64 bg-card rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          review.is_vip 
                            ? "border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" 
                            : ""
                        }`}
                      >
                        {/* Poster and Title */}
                        <div className="flex gap-3 mb-3">
                          <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {posterUrl ? (
                              <img
                                src={posterUrl}
                                alt={review.movie_title || "Movie"}
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
                              {review.movie_title || "Unknown Movie"}
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
                        
                        {/* User Name */}
                        {review.user_name && (
                          <p className="text-xs text-primary font-medium flex items-center gap-1">
                            {review.is_vip && <span>👑</span>}
                            <span>— {review.user_name}</span>
                          </p>
                        )}
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
