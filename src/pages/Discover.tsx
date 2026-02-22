import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { UserCard } from "@/components/UserCard";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  followers_count: number;
}

const Discover = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  // Fetch all users on load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, followers_count")
          .order("followers_count", { ascending: false })
          .limit(50);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users
  useEffect(() => {
    if (!query.trim()) return;

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url, followers_count")
          .ilike("username", `%${query}%`)
          .order("followers_count", { ascending: false })
          .limit(20);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Filter out current user
  const displayUsers = users.filter((u) => u.user_id !== currentUserId);

  return (
    <AppLayout>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-display text-primary glow-pink">
            Discover Trash Collectors
          </h2>
          <p className="text-sm text-muted-foreground">
            Find and follow fellow connoisseurs of cinematic garbage
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 bg-card border-border focus:border-primary rounded-xl text-foreground"
          />
          {searching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                {query ? "No users found." : "No other users yet. Be the first to invite friends!"}
              </p>
            </div>
          ) : (
            displayUsers.map((user, index) => (
              <UserCard
                key={user.user_id}
                userId={user.user_id}
                username={user.username}
                avatarUrl={user.avatar_url}
                followersCount={user.followers_count || 0}
                index={index}
              />
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Discover;
