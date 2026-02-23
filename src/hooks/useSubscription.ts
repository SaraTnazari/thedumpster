import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  plan: "free" | "pro";
  status: string;
  loading: boolean;
  isPro: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    plan: "free",
    status: "active",
    loading: true,
    isPro: false,
  });

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setState({ plan: "free", status: "active", loading: false, isPro: false });
          return;
        }

        const { data, error } = await supabase
          .from("user_subscriptions")
          .select("plan, status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          setState({ plan: "free", status: "active", loading: false, isPro: false });
          return;
        }

        const plan = (data?.plan as "free" | "pro") || "free";
        const status = data?.status || "active";
        const isPro = plan === "pro" && status === "active";

        setState({ plan, status, loading: false, isPro });
      } catch (err) {
        setState({ plan: "free", status: "active", loading: false, isPro: false });
      }
    };

    fetchSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
