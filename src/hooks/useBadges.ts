import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BADGE_DEFINITIONS, type UserStats } from "@/lib/badges";
import { useSubscription } from "./useSubscription";

interface BadgeState {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  isPremium: boolean;
  unlocked: boolean;
  qualified: boolean; // meets condition but maybe not premium
}

export function useBadges() {
  const [badges, setBadges] = useState<BadgeState[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const { isPro, loading: subLoading } = useSubscription();

  const fetchBadges = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // Fetch user stats in parallel
      const [reviewsResult, oneStarResult, votesResult, followersResult, unlockedResult] =
        await Promise.all([
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .lte("shittiness_score", 1),
          supabase
            .from("purgatory_votes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", userId),
          supabase
            .from("badge_unlocks")
            .select("badge_id")
            .eq("user_id", userId),
        ]);

      const userStats: UserStats = {
        reviewCount: reviewsResult.count || 0,
        moviesRated: reviewsResult.count || 0,
        oneStarCount: oneStarResult.count || 0,
        purgatoryVotes: votesResult.count || 0,
        followersCount: followersResult.count || 0,
      };

      setStats(userStats);

      const unlockedIds = new Set(
        (unlockedResult.data || []).map((b) => b.badge_id)
      );

      // Calculate badge states
      const badgeStates: BadgeState[] = BADGE_DEFINITIONS.map((badge) => {
        const qualified = badge.condition(userStats);
        const unlocked = unlockedIds.has(badge.id);

        // Auto-unlock non-premium badges when qualified
        if (qualified && !unlocked && !badge.isPremium) {
          // Insert into badge_unlocks (fire and forget)
          supabase
            .from("badge_unlocks")
            .insert({ user_id: userId, badge_id: badge.id })
            .then(() => {});
        }

        // Auto-unlock premium badges when qualified AND user is pro
        if (qualified && !unlocked && badge.isPremium && isPro) {
          supabase
            .from("badge_unlocks")
            .insert({ user_id: userId, badge_id: badge.id })
            .then(() => {});
        }

        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          isPremium: badge.isPremium,
          unlocked: unlocked || (qualified && (!badge.isPremium || isPro)),
          qualified,
        };
      });

      setBadges(badgeStates);
    } catch (err) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [isPro]);

  useEffect(() => {
    if (!subLoading) {
      fetchBadges();
    }
  }, [subLoading, fetchBadges]);

  return { badges, loading, stats, refresh: fetchBadges };
}
