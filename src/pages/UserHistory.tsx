import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowLeft, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface ReviewWithMovie {
  id: string;
  movie_id: string;
  shittiness_score: number;
  review_text: string | null;
  created_at: string;
  movie: {
    id: string;
    title: string;
    poster_url: string | null;
    release_year: number | null;
    status: "purgatory" | "verified";
  };
}

const UserHistory = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        // Fetch all reviews with movie information
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            id,
            movie_id,
            shittiness_score,
            review_text,
            created_at,
            movies!inner (
              id,
              title,
              poster_url,
              release_year,
              status
            )
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data
        const transformedReviews = (data || []).map((review: any) => ({
          id: review.id,
          movie_id: review.movie_id,
          shittiness_score: review.shittiness_score,
          review_text: review.review_text,
          created_at: review.created_at,
          movie: review.movies || null,
        })).filter((review) => review.movie !== null);

        setReviews(transformedReviews);
      } catch (error: any) {
        console.error("Error fetching user history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [navigate]);

  // Fix image URL: if it starts with http, use as-is; otherwise prepend TMDB base URL
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) {
      return url;
    }
    return `https://image.tmdb.org/t/p/w500${url}`;
  };

  return (
    <AppLayout>
      {/* Fixed Back Button Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-white hover:text-primary transition-colors p-4"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-display text-primary glow-pink">Review History</h2>
          <p className="text-sm text-muted-foreground">
            All the trash you've reviewed
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display text-foreground">No Reviews Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start reviewing movies to see your history here!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const imageUrl = getImageUrl(review.movie.poster_url);
              // shittiness_score is already 1-10, display as X/10
              const displayRating = review.shittiness_score.toFixed(1);

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/movie/${review.movie.id}`}>
                    <div className="rounded-xl bg-card border border-border p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex gap-4">
                        {/* Poster */}
                        <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={review.movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl">🎬</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title and Rating */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-foreground truncate">
                                {review.movie.title}
                              </h3>
                              {review.movie.release_year && (
                                <p className="text-sm text-muted-foreground">
                                  {review.movie.release_year}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 bg-primary/20 rounded-full px-3 py-1 flex-shrink-0">
                              <Star className="w-4 h-4 text-primary fill-primary" />
                              <span className="text-sm font-bold text-primary">
                                {displayRating}/10
                              </span>
                            </div>
                          </div>

                          {/* Review Text */}
                          {review.review_text && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {review.review_text}
                              </p>
                            </div>
                          )}

                          {/* Date */}
                          <div className="text-xs text-muted-foreground">
                            Reviewed {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UserHistory;
