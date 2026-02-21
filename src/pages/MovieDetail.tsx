import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowLeft, Star, CheckCircle, Calendar, Film, User, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AddReviewModal } from "@/components/AddReviewModal";
import confetti from "canvas-confetti";

interface Movie {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  status: "purgatory" | "verified";
  created_at: string;
}

interface ReviewWithProfile {
  id: string;
  shittiness_score: number;
  review_text: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState([5.0]);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState<{ id: string; shittiness_score: number; review_text: string | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);

  // Fix image URL: if it starts with http, use as-is; otherwise prepend TMDB base URL
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) {
      return url;
    }
    return `https://image.tmdb.org/t/p/w500${url}`;
  };

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
      // Fetch reviews for this movie from Supabase
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("movie_id", id)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        throw reviewsError;
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setReviewsLoading(false);
        return;
      }

      // Fetch profiles for all user_ids in the reviews
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Combine reviews with profiles
      const combined: ReviewWithProfile[] = reviewsData.map((review: any) => {
        const profile = profilesData?.find(p => p.user_id === review.user_id);
        return {
          id: review.id,
          shittiness_score: review.shittiness_score,
          review_text: review.review_text,
          created_at: review.created_at,
          profiles: profile ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
          } : null,
        };
      });

      setReviews(combined);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const checkUserReview = async () => {
      console.log("[MovieDetail] Checking user review for movie:", id);
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user && id) {
        try {
          // Check if user has already reviewed this movie
          const { data: existingReview, error: reviewCheckError } = await supabase
            .from("reviews")
            .select("id, shittiness_score, review_text")
            .eq("movie_id", id)
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (reviewCheckError) {
            console.error("[MovieDetail] Error checking user review:", reviewCheckError);
            return;
          }

          if (existingReview) {
            console.log("[MovieDetail] Found existing review:", existingReview);
            setUserReview(existingReview);
            setRating([existingReview.shittiness_score]);
            setReviewText(existingReview.review_text || "");
          } else {
            console.log("[MovieDetail] No existing review found");
            setUserReview(null);
            setRating([5.0]);
            setReviewText("");
          }
        } catch (err) {
          console.error("[MovieDetail] Error in checkUserReview:", err);
        }
      }
    };

    checkUserReview();
  }, [id]);

  // Handle review submission from AddReviewModal
  const handleAddReviewSubmit = async (rating: number, content: string) => {
    if (!id) {
      console.error("Error: Movie ID is missing");
      return;
    }

    try {
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error("Error: User not authenticated", sessionError);
        toast({
          title: "Error",
          description: "You must be logged in to submit a review",
          variant: "destructive",
        });
        return;
      }

      // Convert 1-5 rating to 0-10 scale (1 = 2, 2 = 4, 3 = 6, 4 = 8, 5 = 10)
      const shittinessScore = rating * 2;

      // Get user name from localStorage
      const userName = localStorage.getItem('dumpster_username') || 'Anonymous';
      
      // Check if user is Pro for is_vip field
      const userIsVip = localStorage.getItem('isProUser') === 'true';

      // Insert review into Supabase
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          movie_id: id,
          user_id: session.user.id,
          shittiness_score: shittinessScore,
          review_text: content || null,
          movie_title: movie?.title || null,
          poster_path: movie?.poster_url || null,
          user_name: userName,
          is_vip: userIsVip,
        });

      if (insertError) {
        console.error("Error inserting review:", insertError);
        toast({
          title: "Error",
          description: "Failed to submit review",
          variant: "destructive",
        });
        return;
      }

      // Refetch reviews to update the list
      await fetchReviews();

      // Check if user is Pro and trigger confetti
      if (userIsVip) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      toast({
        title: "Review submitted!",
        description: "Your review has been saved.",
      });
    } catch (err: any) {
      console.error("Error in handleAddReviewSubmit:", err);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    console.log("[MovieDetail] handleReviewSubmit called");
    
    // Step 1: Validate inputs
    if (!id) {
      console.error("[MovieDetail] No movie ID available");
      toast({
        title: "Error",
        description: "Movie ID is missing",
        variant: "destructive",
      });
      return;
    }

    // Step 2: Check authentication
    console.log("[MovieDetail] Checking authentication");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[MovieDetail] Session error:", sessionError);
      toast({
        title: "Error",
        description: "Failed to verify authentication",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user) {
      console.log("[MovieDetail] User not logged in");
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    console.log("[MovieDetail] User authenticated:", session.user.id);

    // Step 3: Calculate score
    const currentRating = rating[0] || 5.0;
    const shittinessScore = Math.max(1, Math.min(10, Math.round(currentRating)));
    const trimmedReviewText = reviewText.trim() || null;
    
    console.log("[MovieDetail] Submitting review:", {
      movie_id: id,
      user_id: session.user.id,
      shittiness_score: shittinessScore,
      has_text: !!trimmedReviewText,
    });

    // Step 4: Set submitting state
    setSubmitting(true);

    try {
      // Get user name from localStorage
      const userName = localStorage.getItem('dumpster_username') || 'Anonymous';
      
      // Check if user is Pro for is_vip field
      const userIsVip = localStorage.getItem('isProUser') === 'true';

      // Step 5: Upsert review
      const { error: reviewError } = await supabase
        .from("reviews")
        .upsert({
          user_id: session.user.id,
          movie_id: id,
          shittiness_score: shittinessScore,
          review_text: trimmedReviewText,
          user_name: userName,
          is_vip: userIsVip,
        }, {
          onConflict: "user_id,movie_id",
        });

      if (reviewError) {
        console.error("[MovieDetail] Review upsert error:", reviewError);
        throw reviewError;
      }

      console.log("[MovieDetail] Review saved successfully");

      // Check if user is Pro and trigger confetti
      if (userIsVip) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Step 6: Show success message
      const isUpdate = !!userReview;
      toast({
        title: isUpdate ? "Review updated!" : "Review submitted!",
        description: `Your review has been ${isUpdate ? "updated" : "saved"}.`,
      });

      // Step 7: Close modal
      setReviewModalOpen(false);

      // Step 8: Refresh reviews list
      console.log("[MovieDetail] Refreshing reviews list");
      setReviewsLoading(true);
      await fetchReviews();

      // Step 9: Update user review state
      console.log("[MovieDetail] Updating user review state");
      const { data: updatedReview, error: fetchError } = await supabase
        .from("reviews")
        .select("id, shittiness_score, review_text")
        .eq("movie_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("[MovieDetail] Error fetching updated review:", fetchError);
      } else if (updatedReview) {
        console.log("[MovieDetail] Updated user review state:", updatedReview);
        setUserReview(updatedReview);
      }

      console.log("[MovieDetail] Review submission complete");
    } catch (error: any) {
      console.error("[MovieDetail] Error in handleReviewSubmit:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      console.log("[MovieDetail] handleReviewSubmit finished");
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

          {/* Rate & Review Button */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => setReviewModalOpen(true)}
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

        {/* Review Modal */}
        <Dialog 
          open={reviewModalOpen} 
          onOpenChange={(open) => {
            setReviewModalOpen(open);
            // Reset form when closing without submitting
            if (!open && userReview) {
              setRating([userReview.shittiness_score]);
              setReviewText(userReview.review_text || "");
            } else if (!open) {
              setRating([5.0]);
              setReviewText("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary glow-pink">
                {userReview ? "Edit Your Review" : "Rate This Trash"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
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
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="w-full h-12 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {userReview ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Large Write Review Button at Bottom */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-safe">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <Button
            onClick={() => setAddReviewModalOpen(true)}
            className="w-full h-14 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
          >
            <Star className="w-5 h-5 mr-2" />
            Write a Review
          </Button>
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
