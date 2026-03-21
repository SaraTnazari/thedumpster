import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isNative } from "@/lib/native";
import { checkProOwnership } from "@/lib/revenuecat";

interface RevenueCatState {
  isPro: boolean;
  loading: boolean;
  offerings: any | null;
}

export function useRevenueCat() {
  const [state, setState] = useState<RevenueCatState>({
    isPro: false,
    loading: true,
    offerings: null,
  });

  const checkEntitlements = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setState({ isPro: false, loading: false, offerings: null });
        return;
      }

      let isPro = false;

      if (isNative) {
        isPro = await checkProOwnership();
      }

      // Also check Supabase as fallback
      if (!isPro) {
        const { data } = await supabase
          .from("user_subscriptions")
          .select("plan, status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        isPro = data?.plan === "pro" && data?.status === "active";
      }

      setState((prev) => ({ ...prev, isPro, loading: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkEntitlements();
  }, [checkEntitlements]);

  return {
    ...state,
    checkEntitlements,
  };
}
