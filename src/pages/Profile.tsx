import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, LogIn, FileText, Vote, Star, Award, Users, CreditCard, LogOut } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null>(null);
  const [stats, setStats] = useState({
    reviewsWritten: 0,
    purgatoryVotes: 0,
    moviesRated: 0,
  });
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('dumpster_username');
      toast({
        title: "Signed out",
        description: "You've been logged out successfully.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchStats = async (userId: string) => {
      try {
        // Count reviews written
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (reviewsError) throw reviewsError;

        // Count unique movies rated (distinct movie_ids)
        const { data: reviewsData, error: moviesError } = await supabase
          .from("reviews")
          .select("movie_id")
          .eq("user_id", userId);

        if (moviesError) throw moviesError;
        const uniqueMovies = new Set(reviewsData?.map(r => r.movie_id) || []);
        const moviesRatedCount = uniqueMovies.size;

        // Count purgatory votes
        const { count: votesCount, error: votesError } = await supabase
          .from("purgatory_votes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (votesError) throw votesError;

        setStats({
          reviewsWritten: reviewsCount || 0,
          moviesRated: moviesRatedCount,
          purgatoryVotes: votesCount || 0,
        });
      } catch (error) {
        // Silent error handling
      }
    };

    const checkAuthAndFetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user) {
        await fetchStats(session.user.id);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url, bio")
          .eq("user_id", session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // Silent error handling
        } else {
          setProfile(profileData || { username: null, avatar_url: null, bio: null });
        }
      } else {
        setStats({ reviewsWritten: 0, purgatoryVotes: 0, moviesRated: 0 });
        setProfile(null);
      }

      setLoading(false);
    };

    checkAuthAndFetchStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        await fetchStats(session.user.id);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url, bio")
          .eq("user_id", session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // Silent error handling
        } else {
          setProfile(profileData || { username: null, avatar_url: null, bio: null });
        }
      } else {
        setStats({ reviewsWritten: 0, purgatoryVotes: 0, moviesRated: 0 });
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
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
        <div className="py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display text-foreground">Not Signed In</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Create an account to track your reviews and earn badges as a trash connoisseur.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-3 gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6 pt-safe" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        {/* Avatar & Identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-neon-purple p-[2px]">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
              <AvatarFallback className="bg-card">
                <User className="w-10 h-10 text-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-2xl font-display text-foreground">
            {profile?.username || "TrashPanda"}
          </h2>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
              {profile.bio}
            </p>
          )}
          <div
            onClick={() => setShowUpgrade(true)}
            className={`inline-flex items-center gap-2 px-4 py-1 rounded-full cursor-pointer transition-colors ${
              isPro
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 border border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.7)]"
                : "bg-primary/20 border border-primary/30 hover:bg-primary/30"
            }`}
          >
            <Award className={`w-4 h-4 ${isPro ? "text-yellow-900" : "text-primary"}`} />
            <span className={`text-sm font-medium ${isPro ? "text-yellow-900" : "text-primary"}`}>Trash Connoisseur</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            {
              icon: FileText,
              label: "Reviews Written",
              value: stats.reviewsWritten.toString(),
              clickable: true,
              onClick: () => navigate("/profile/history"),
            },
            {
              icon: Vote,
              label: "Purgatory Votes",
              value: stats.purgatoryVotes.toString(),
              clickable: false,
            },
            {
              icon: Star,
              label: "Movies Rated",
              value: stats.moviesRated.toString(),
              clickable: true,
              onClick: () => navigate("/profile/history"),
            },
          ].map((stat, index) => {
            const StatComponent = (
              <div className={`glass-dark rounded-xl p-4 text-center space-y-2 ${stat.clickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}>
                <stat.icon className="w-5 h-5 text-primary mx-auto" />
                <div className="text-2xl font-display text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            );

            if (stat.clickable && stat.onClick) {
              return (
                <div key={stat.label} onClick={stat.onClick}>
                  {StatComponent}
                </div>
              );
            }

            return (
              <div key={stat.label}>
                {StatComponent}
              </div>
            );
          })}
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          {[
            { icon: Users, label: "Discover People", to: "/discover" },
            { icon: Award, label: "Hall of Shame", to: "/hall-of-shame" },
            { icon: Star, label: "My Badges", to: "/badges" },
            { icon: CreditCard, label: "Billing & Plan", to: "/billing" },
            { icon: User, label: "Edit Profile", to: "/profile/edit" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{item.label}</span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-red-500/10 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium text-red-400">Sign Out</span>
          </button>
        </motion.div>
      </div>
      {showUpgrade && (
        <UpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
        />
      )}
    </AppLayout>
  );
};

export default Profile;
