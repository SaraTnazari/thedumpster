import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FollowState {
  isFollowing: boolean;
  loading: boolean;
  followersCount: number;
  followingCount: number;
}

export function useFollows(targetUserId?: string) {
  const [state, setState] = useState<FollowState>({
    isFollowing: false,
    loading: true,
    followersCount: 0,
    followingCount: 0,
  });

  const fetchFollowState = useCallback(async () => {
    if (!targetUserId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Get follower/following counts for the target user
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);

      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);

      // Check if current user follows this target
      let isFollowing = false;
      if (session?.user && session.user.id !== targetUserId) {
        const { data } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", session.user.id)
          .eq("following_id", targetUserId)
          .maybeSingle();

        isFollowing = !!data;
      }

      setState({
        isFollowing,
        loading: false,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchFollowState();
  }, [fetchFollowState]);

  const toggleFollow = useCallback(async () => {
    if (!targetUserId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      if (state.isFollowing) {
        // Unfollow
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", targetUserId);
      } else {
        // Follow
        await supabase
          .from("follows")
          .insert({
            follower_id: session.user.id,
            following_id: targetUserId,
          });
      }

      // Refresh state
      await fetchFollowState();
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [targetUserId, state.isFollowing, fetchFollowState]);

  return { ...state, toggleFollow, refresh: fetchFollowState };
}

// Hook to get current user's following feed
export function useFollowingFeed() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Get who the user follows
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", session.user.id);

        if (!followsData || followsData.length === 0) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const followingIds = followsData.map((f) => f.following_id);

        // Get reviews from followed users
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*")
          .in("user_id", followingIds)
          .order("created_at", { ascending: false })
          .limit(20);

        setReviews(reviewsData || []);
      } catch (err) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return { reviews, loading };
}
