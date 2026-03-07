import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Award, Star } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BottomNav } from "@/components/layout/BottomNav";
import { MovieListItem } from "@/components/MovieListItem";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/lib/image-utils";

interface MovieWithRating {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  status: "purgatory" | "verified";
  average_score: number;
  review_count: number;
}

const PodiumCard = ({ 
  movie, 
  position, 
  rank 
}: { 
  movie: MovieWithRating;
  position: "left" | "center" | "right";
  rank: number;
}) => {
  const isCenter = position === "center";
  const positionStyles = {
    left: "order-1 h-32",
    center: "order-2 h-44",
    right: "order-3 h-28",
  };
  
  const rankColors = {
    1: "from-primary to-neon-purple",
    2: "from-zinc-400 to-zinc-600",
    3: "from-amber-600 to-amber-800",
  };

  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : Award;

  const imageUrl = getImageUrl(movie.poster_url);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (position === "center" ? 0 : 0.2) }}
      className={`flex flex-col items-center justify-center text-center ${positionStyles[position]}`}
    >
      {/* Movie poster */}
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className={`relative ${isCenter ? 'w-28 h-40' : 'w-20 h-28'} rounded-xl overflow-hidden bg-muted mb-3 ${isCenter ? 'box-glow-pink' : ''}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <span className={`${isCenter ? 'text-4xl' : 'text-2xl'}`}>🎬</span>
          </div>
        )}
        
        {/* Rank badge */}
        <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} flex items-center justify-center shadow-lg`}>
          <span className="text-sm font-bold text-white">{rank}</span>
        </div>
      </motion.div>

      {/* Title and Info - Centered */}
      <div className="flex flex-col items-center justify-center text-center space-y-1 w-full px-2">
        <h4 className={`font-display text-center w-full ${isCenter ? 'text-base text-primary glow-pink' : 'text-sm text-foreground'} line-clamp-2`}>
          {movie.title}
        </h4>
        {movie.release_year && (
          <p className="text-xs text-muted-foreground text-center">{movie.release_year}</p>
        )}
        
        {/* Score */}
        <div className={`flex items-center justify-center gap-1 mt-1 ${isCenter ? 'text-primary' : 'text-muted-foreground'}`}>
          <Star className={`w-4 h-4 ${isCenter ? 'fill-primary' : ''}`} />
          <span className={`text-lg font-display ${isCenter ? 'text-primary' : ''}`}>{movie.average_score.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const [topMovies, setTopMovies] = useState<MovieWithRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        // Fetch movies with their average ratings from reviews
        // We'll need to calculate the average score per movie
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("movie_id, shittiness_score");

        if (reviewsError) throw reviewsError;

        // Calculate average score per movie
        const movieScores: Record<string, { total: number; count: number }> = {};
        
        reviews?.forEach((review) => {
          if (!movieScores[review.movie_id]) {
            movieScores[review.movie_id] = { total: 0, count: 0 };
          }
          movieScores[review.movie_id].total += review.shittiness_score;
          movieScores[review.movie_id].count += 1;
        });

        // Get all movies
        const { data: movies, error: moviesError } = await supabase
          .from("movies")
          .select("*")
          .order("created_at", { ascending: false });

        if (moviesError) throw moviesError;

        // Combine movies with their ratings
        const moviesWithRatings: MovieWithRating[] = (movies || [])
          .map((movie) => {
            const scoreData = movieScores[movie.id];
            const average_score = scoreData 
              ? scoreData.total / scoreData.count 
              : 0;
            
            return {
              id: movie.id,
              title: movie.title,
              poster_url: movie.poster_url,
              release_year: movie.release_year,
              status: movie.status,
              average_score,
              review_count: scoreData?.count || 0,
            };
          })
          // Only include movies with at least one review
          .filter((movie) => movie.review_count > 0)
          // Sort by average score descending
          .sort((a, b) => b.average_score - a.average_score)
          // Take top 10
          .slice(0, 10);

        setTopMovies(moviesWithRatings);
      } catch {
        // Error fetching leaderboard
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();
  }, []);

  // Split into top 3 (podium) and rest (honorable mentions)
  const topThree = topMovies.slice(0, 3);
  const honorableMentions = topMovies.slice(3);

  // Reorder for visual display: 2nd, 1st, 3rd
  const orderedTop = topThree.length >= 3 
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  return (
    <AppLayout>
      <div className="pb-6 space-y-8">

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : topMovies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display text-foreground">No Rankings Yet</h3>
              <p className="text-sm text-muted-foreground">
                Start rating movies to see the Top Trash leaderboard!
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Podium */}
            {topThree.length > 0 && (
              <div className="flex items-end justify-center gap-4 mt-8">
                {orderedTop.length >= 3 && (
                  <>
                    {/* Rank 2 */}
                    <div className="flex flex-col justify-end items-center">
                      {/* 1. MOVIE CARD (Top) */}
                      <img
                        src={getImageUrl(orderedTop[0].poster_url) || undefined}
                        alt={orderedTop[0].title}
                        className="w-24 h-36 rounded shadow-lg mb-4 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-sm text-center mb-1 line-clamp-2 max-w-[100px]">{orderedTop[0].title}</p>
                      <p className="mb-2 text-primary font-bold">{orderedTop[0].average_score.toFixed(1)}</p>
                      {/* 2. RANK BOX (Bottom) */}
                      <div className="w-24 h-12 rounded-t-lg bg-gradient-to-b from-zinc-700 to-zinc-800 flex items-center justify-center">
                        <span className="text-2xl font-display text-zinc-400">2</span>
                      </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col justify-end items-center">
                      {/* 1. MOVIE CARD (Top) */}
                      <img
                        src={getImageUrl(orderedTop[1].poster_url) || undefined}
                        alt={orderedTop[1].title}
                        className="w-28 h-40 rounded shadow-lg mb-4 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-base text-center mb-1 line-clamp-2 max-w-[120px] text-primary">{orderedTop[1].title}</p>
                      <p className="mb-2 text-primary font-bold">{orderedTop[1].average_score.toFixed(1)}</p>
                      {/* 2. RANK BOX (Bottom) */}
                      <div className="w-28 h-16 rounded-t-lg gradient-fire flex items-center justify-center">
                        <span className="text-3xl font-display text-white">1</span>
                      </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col justify-end items-center">
                      {/* 1. MOVIE CARD (Top) */}
                      <img
                        src={getImageUrl(orderedTop[2].poster_url) || undefined}
                        alt={orderedTop[2].title}
                        className="w-20 h-28 rounded shadow-lg mb-4 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <p className="text-xs text-center mb-1 line-clamp-2 max-w-[90px]">{orderedTop[2].title}</p>
                      <p className="mb-2 text-primary font-bold">{orderedTop[2].average_score.toFixed(1)}</p>
                      {/* 2. RANK BOX (Bottom) */}
                      <div className="w-24 h-10 rounded-t-lg bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center">
                        <span className="text-2xl font-display text-amber-300">3</span>
                      </div>
                    </div>
                  </>
                )}
                {orderedTop.length === 2 && (
                  <>
                    <div className="flex flex-col justify-end items-center">
                      <img
                        src={getImageUrl(orderedTop[0].poster_url) || undefined}
                        alt={orderedTop[0].title}
                        className="w-24 h-36 rounded shadow-lg mb-4 object-cover"
                      />
                      <p className="text-sm text-center mb-1 line-clamp-2 max-w-[100px]">{orderedTop[0].title}</p>
                      <p className="mb-2 text-primary font-bold">{orderedTop[0].average_score.toFixed(1)}</p>
                      <div className="w-24 h-12 rounded-t-lg bg-gradient-to-b from-zinc-700 to-zinc-800 flex items-center justify-center">
                        <span className="text-2xl font-display text-zinc-400">2</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end items-center">
                      <img
                        src={getImageUrl(orderedTop[1].poster_url) || undefined}
                        alt={orderedTop[1].title}
                        className="w-28 h-40 rounded shadow-lg mb-4 object-cover"
                      />
                      <p className="text-base text-center mb-1 line-clamp-2 max-w-[120px] text-primary">{orderedTop[1].title}</p>
                      <p className="mb-2 text-primary font-bold">{orderedTop[1].average_score.toFixed(1)}</p>
                      <div className="w-28 h-16 rounded-t-lg gradient-fire flex items-center justify-center">
                        <span className="text-3xl font-display text-white">1</span>
                      </div>
                    </div>
                  </>
                )}
                {orderedTop.length === 1 && (
                  <div className="flex flex-col justify-end items-center">
                    <img
                      src={getImageUrl(orderedTop[0].poster_url) || undefined}
                      alt={orderedTop[0].title}
                      className="w-28 h-40 rounded shadow-lg mb-4 object-cover"
                    />
                    <p className="text-base text-center mb-1 line-clamp-2 max-w-[120px] text-primary">{orderedTop[0].title}</p>
                    <p className="mb-2 text-primary font-bold">{orderedTop[0].average_score.toFixed(1)}</p>
                    <div className="w-28 h-16 rounded-t-lg gradient-fire flex items-center justify-center">
                      <span className="text-3xl font-display text-white">1</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Honorable Mentions */}
            {honorableMentions.length > 0 && (
              <section className="space-y-4 mt-12">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-display text-foreground">Honorable Mentions</h2>
                </div>
                
                <div className="space-y-2">
                  {honorableMentions.map((movie, index) => (
                    <div key={movie.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-display text-muted-foreground">
                        {index + 4}
                      </span>
                      <div className="flex-1">
                        <MovieListItem
                          id={movie.id}
                          title={movie.title}
                          posterUrl={getImageUrl(movie.poster_url) || undefined}
                          year={movie.release_year || undefined}
                          score={movie.average_score}
                          isVerified={movie.status === "verified"}
                          index={index}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </AppLayout>
  );
};

export default Leaderboard;
