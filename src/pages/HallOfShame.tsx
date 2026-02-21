import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { MovieListItem } from "@/components/MovieListItem";

interface Review {
  id: string;
  movie_id: string;
  shittiness_score: number;
  movie: {
    id: string;
    title: string;
    poster_url: string | null;
    release_year: number | null;
    status: "purgatory" | "verified";
  };
}

const HallOfShame = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHallOfShame = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          navigate("/auth");
          return;
        }

        // Fetch reviews with shittiness_score = 1 (worst rating)
        const { data, error } = await supabase
          .from("reviews")
          .select(`
            id,
            movie_id,
            shittiness_score,
            movies!inner (
              id,
              title,
              poster_url,
              release_year,
              status
            )
          `)
          .eq("user_id", session.user.id)
          .eq("shittiness_score", 1)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match our interface
        // Supabase returns joined data as an object, not an array
        const transformedReviews = (data || []).map((review: any) => {
          const movie = review.movies;
          return {
            id: review.id,
            movie_id: review.movie_id,
            shittiness_score: review.shittiness_score,
            movie: movie || null,
          };
        }).filter((review) => review.movie !== null);

        setReviews(transformedReviews);
      } catch (error: any) {
        console.error("Error fetching Hall of Shame:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHallOfShame();
  }, [navigate]);

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
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-display text-primary glow-pink">Hall of Shame</h2>
          <p className="text-sm text-muted-foreground">
            Movies you've rated 1 star - the absolute worst of the worst
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
              <h3 className="text-xl font-display text-foreground">No Shame Yet</h3>
              <p className="text-sm text-muted-foreground">
                You haven't rated any movies 1 star yet. Start reviewing to build your Hall of Shame!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review, index) => (
              <MovieListItem
                key={review.id}
                id={review.movie.id}
                title={review.movie.title}
                posterUrl={review.movie.poster_url || undefined}
                year={review.movie.release_year || undefined}
                isVerified={review.movie.status === "verified"}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HallOfShame;
