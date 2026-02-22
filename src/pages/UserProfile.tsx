import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, User, Star, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/FollowButton";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useFollows } from "@/hooks/useFollows";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface ReviewData {
  id: string;
  movie_id: string;
  shittiness_score: number;
  review_text: string | null;
  created_at: string;
  movies: {
    title: string;
    poster_url: string | null;
  } | null;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { followersCount, followingCount } = useFollows(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        // Check if viewing own profile
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id === userId) {
          setIsOwnProfile(true);
          navigate("/profile", { replace: true });
          return;
        }

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, bio")
          .eq("user_id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch their reviews with movie data
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("id, movie_id, shittiness_score, review_text, created_at, movies(title, poster_url)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        setReviews(reviewsData || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://image.tmdb.org/t/p/w500${url}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <div className="rounded-2xl gradient-fire p-[1px]">
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <h2 className="text-2xl font-display text-foreground">User Not Found</h2>
              <button onClick={() => navigate(-1)} className="text-primary hover:underline">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <Avatar className="w-24 h-24 mx-auto border-2 border-primary">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              <User className="w-10 h-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-display text-foreground">
            {profile.username || "Anonymous"}
          </h2>

          {profile.bio && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
              {profile.bio}
            </p>
          )}

          {/* Follow Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-display text-foreground text-lg">{followersCount}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-display text-foreground text-lg">{followingCount}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="font-display text-foreground text-lg">{reviews.length}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
          </div>

          {/* Follow Button */}
          {userId && <FollowButton targetUserId={userId} />}
        </motion.div>

        {/* Reviews Section - Gated behind Pro */}
        <SubscriptionGate fallbackMessage="Upgrade to Pro to see what other users are reviewing">
          <div className="space-y-4">
            <h3 className="text-lg font-display text-foreground">Their Reviews</h3>
            {reviews.length === 0 ? (
              <div className="glass-dark rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              reviews.map((review, index) => {
                const posterUrl = getImageUrl(review.movies?.poster_url || null);
                const rating = Math.round(review.shittiness_score / 2);

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/movie/${review.movie_id}`)}
                    className="flex gap-3 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {/* Poster */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {posterUrl ? (
                        <img src={posterUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl">🎬</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-display text-foreground text-sm truncate">
                        {review.movies?.title || "Unknown Movie"}
                      </h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <Trash2
                            key={v}
                            className={`w-3 h-3 ${v <= rating ? "text-primary" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                      {review.review_text && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </SubscriptionGate>
      </div>
    </AppLayout>
  );
};

export default UserProfile;
