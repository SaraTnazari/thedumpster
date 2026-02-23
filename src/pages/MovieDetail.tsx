import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowLeft, Star, CheckCircle, Calendar, Film, User, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddReviewModal } from "@/components/AddReviewModal";
import { PurgatoryVoteCard } from "@/components/PurgatoryVoteCard";
import { getImageUrl } from "@/lib/image-utils";
import confetti from "canvas-confetti";

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  status: "purgatory" | "verified";
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  shittiness_score: number;
  review_text: string | null;
  created_at: string;
}

interface Profile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
}

interface ReviewWithProfile extends Review {
  profiles: Profile | null;
}

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError("Movie ID is required");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("movies")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError("Movie not found");
        } else {
          setMovie(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("movie_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }

      const userIds = [...new Set(reviewsData.map((r: any) => r.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      const combined: ReviewWithProfile[] = reviewsData.map((review: any) => {
        const profile = profilesData?.find((p: any) => p.user_id === review.user_id);
        return {
          id: review.id,
          user_id: review.user_id,
          shittiness_score: review.shittiness_score,
          review_text: review.review_text,
          created_at: review.created_at,
          profiles: profile ? {
            user_id: profile.user_id,
            username: profile.username,
            avatar_url: profile.avatar_url,
          } : null,
        };
      });

      setReviews(combined);
    } catch (err: any) {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user && id) {
        try {
          const { data: existingReview, error: reviewCheckError } = await supabase
            .from("reviews")
            .select("id, user_id, shittiness_score, review_text, created_at")
            .eq("movie_id", id)
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (reviewCheckError) {
            throw reviewCheckError;
          }

          if (existingReview) {
            setUserReview(existingReview);
          } else {
            setUserReview(null);
          }
        } catch (err) {
          setUserReview(null);
        }
      }
    };

    checkUserSession();
  }, [id]);

  const handleAddReviewSubmit = async (rating: number, content: string) => {
    try {
      if (!id) {
        toast({ title: "Debug", description: "Movie ID is missing from URL", variant: "destructive" });
        throw new Error("Movie ID missing");
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.error("[REVIEW DEBUG] session:", session?.user?.id, "movieId:", id, "rating:", rating);

      if (sessionError || !session?.user) {
        toast({
          title: "Debug",
          description: "Session error: " + (sessionError?.message || "No user session found"),
          variant: "destructive",
        });
        throw new Error("Not logged in");
      }

      const shittinessScore = Math.round(rating * 2);
      console.error("[REVIEW DEBUG] shittinessScore:", shittinessScore);

      // Check if user already has a review for this movie
      const { data: existingReview, error: checkError } = await supabase
        .from("reviews")
        .select("id")
        .eq("movie_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (checkError) {
        console.error("[REVIEW DEBUG] Check existing review error:", JSON.stringify(checkError));
        toast({
          title: "Check Error",
          description: "Could not check existing review: " + (checkError.message || JSON.stringify(checkError)),
          variant: "destructive",
        });
        throw new Error(checkError.message);
      }

      console.error("[REVIEW DEBUG] existingReview:", existingReview);

      let submitError: any = null;

      if (existingReview) {
        console.error("[REVIEW DEBUG] Updating existing review:", existingReview.id);
        const { error } = await supabase
          .from("reviews")
          .update({
            shittiness_score: shittinessScore,
            review_text: content || null,
          })
          .eq("id", existingReview.id);
        submitError = error;
      } else {
        console.error("[REVIEW DEBUG] Inserting new review");
        const { error } = await supabase
          .from("reviews")
          .insert({
            movie_id: id,
            user_id: session.user.id,
            shittiness_score: shittinessScore,
            review_text: content || null,
          });
        submitError = error;
      }

      if (submitError) {
        console.error("[REVIEW DEBUG] Submit error:", JSON.stringify(submitError));
        const msg = submitError.message || submitError.details || submitError.hint || JSON.stringify(submitError);
        toast({
          title: "Submit Error",
          description: msg,
          variant: "destructive",
        });
        throw new Error(msg);
      }

      console.error("[REVIEW DEBUG] Review submitted successfully!");

      await fetchReviews();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {
        // confetti is optional
      }

      toast({
        title: "Review submitted!",
        description: "Your review has been saved.",
      });

      setAddReviewModalOpen(false);

      const { data: updatedReview } = await supabase
        .from("reviews")
        .select("id, user_id, shittiness_score, review_text, created_at")
        .eq("movie_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (updatedReview) {
        setUserReview(updatedReview);
      }
    } catch (err: any) {
      console.error("[REVIEW DEBUG] Caught error:", err);
      // Only show toast if not already shown above
      if (!err.message?.includes("Movie ID") && !err.message?.includes("logged in")) {
        toast({
          title: "Unexpected Error",
          description: err.message || "Something went wrong: " + String(err),
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !movie) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <h2 className="text-2xl font-display text-foreground">Movie Not Found</h2>
              <p className="text-sm text-muted-foreground">{error || "This movie doesn't exist in the dumpster."}</p>
              <Button
                onClick={() => navigate(-1)}
                className="gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Floating Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-12 left-4 z-50 p-3 bg-black/60 backdrop-blur-md rounded-full text-white shadow-lg border border-white/10 hover:bg-black/80 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="py-6 space-y-6 pt-safe" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        {/* Movie Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Poster and Title */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 flex-shrink-0">
              {getImageUrl(movie.poster_url) ? (
                <img
                  src={getImageUrl(movie.poster_url)!}
                  alt={movie.title}
                  className="w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-6xl">🎬</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display text-foreground glow-pink mb-2">
                    {movie.title}
                  </h1>
                  {movie.release_year && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{movie.release_year}</span>
                    </div>
                  )}
                </div>
                {movie.status === "verified" && (
                  <div className="flex items-center gap-2 bg-secondary/20 rounded-full px-3 py-1">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium text-secondary">Verified Trash</span>
                  </div>
                )}
                {movie.status === "purgatory" && (
                  <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                    <Film className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Purgatory</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Added to Dumpster on {new Date(movie.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Purgatory Voting */}
          {movie.status === "purgatory" && (
            <PurgatoryVoteCard movieId={movie.id} />
          )}

          {/* Rate & Review Button */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => setAddReviewModalOpen(true)}
                className="w-full h-12 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                <Star className="w-5 h-5 mr-2" />
                {userReview ? "Edit My Review" : "Rate This Trash"}
              </Button>
            </motion.div>
          )}

          {/* Reviews Section */}
          <div className="rounded-2xl gradient-fire p-[1px]">
            <div className="bg-card rounded-2xl p-6">
              <h2 className="text-xl font-display text-foreground mb-4">Community Trash Talk</h2>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No one has trashed this movie yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const displayRating = review.shittiness_score.toFixed(1);
                    const avatarUrl = review.profiles?.avatar_url;
                    const username = review.profiles?.username || "Anonymous";

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                      >
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${avatarUrl ? "hidden" : ""}`}>
                              <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Username and Rating */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-foreground">{username}</span>
                              <div className="flex items-center gap-1 bg-primary/20 rounded-full px-2 py-1">
                                <Star className="w-3 h-3 text-primary fill-primary" />
                                <span className="text-xs font-bold text-primary">
                                  {displayRating}/10
                                </span>
                              </div>
                            </div>

                            {/* Review Text */}
                            {review.review_text && (
                              <p className="text-sm text-muted-foreground">
                                {review.review_text}
                              </p>
                            )}

                            {/* Date */}
                            <p className="text-xs text-muted-foreground/60">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={addReviewModalOpen}
        onClose={() => setAddReviewModalOpen(false)}
        onSubmit={handleAddReviewSubmit}
      />
    </AppLayout>
  );
};

export default MovieDetail;
