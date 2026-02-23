import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./useSubscription";

const FREE_DAILY_LIMIT = 5;

interface ReviewLimitState {
  reviewsToday: number;
  remainingToday: number;
  canReview: boolean;
  loading: boolean;
  dailyLimit: number;
}

export function useReviewLimit() {
  const { isPro, loading: subLoading } = useSubscription();
  const [state, setState] = useState<ReviewLimitState>({
    reviewsToday: 0,
    remainingToday: FREE_DAILY_LIMIT,
    canReview: true,
    loading: true,
    dailyLimit: FREE_DAILY_LIMIT,
  });

  const fetchLimit = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setState({
          reviewsToday: 0,
          remainingToday: FREE_DAILY_LIMIT,
          canReview: false, // not logged in
          loading: false,
          dailyLimit: FREE_DAILY_LIMIT,
        });
        return;
      }

      if (isPro) {
        setState({
          reviewsToday: 0,
          remainingToday: Infinity,
          canReview: true,
          loading: false,
          dailyLimit: Infinity,
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("review_daily_limits")
        .select("review_count")
        .eq("user_id", session.user.id)
        .eq("review_date", today)
        .maybeSingle();

      if (error) {
        // Error handled silently
      }

      const count = data?.review_count || 0;
      const remaining = Math.max(0, FREE_DAILY_LIMIT - count);

      setState({
        reviewsToday: count,
        remainingToday: remaining,
        canReview: count < FREE_DAILY_LIMIT,
        loading: false,
        dailyLimit: FREE_DAILY_LIMIT,
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [isPro]);

  useEffect(() => {
    if (!subLoading) {
      fetchLimit();
    }
  }, [subLoading, fetchLimit]);

  const incrementCount = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || isPro) return;

    const today = new Date().toISOString().split("T")[0];

    // Upsert the daily count
    const { error } = await supabase
      .from("review_daily_limits")
      .upsert(
        {
          user_id: session.user.id,
          review_date: today,
          review_count: state.reviewsToday + 1,
        },
        { onConflict: "user_id,review_date" }
      );

    if (error) {
      // Error handled silently
    }

    // Refresh state
    await fetchLimit();
  }, [isPro, state.reviewsToday, fetchLimit]);

  return { ...state, incrementCount, refresh: fetchLimit };
}
