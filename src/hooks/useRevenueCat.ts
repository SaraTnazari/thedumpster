import { useState, useEffect, useCallback } from "react";
import { Purchases } from "@revenuecat/purchases-js";
import { supabase } from "@/integrations/supabase/client";

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";

let purchasesInstance: Purchases | null = null;

function getPurchases(userId: string): Purchases {
  if (!purchasesInstance) {
    purchasesInstance = Purchases.configure(RC_API_KEY, userId);
  }
  return purchasesInstance;
}

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
      if (!session?.user || !RC_API_KEY) {
        setState({ isPro: false, loading: false, offerings: null });
        return;
      }

      const purchases = getPurchases(session.user.id);
      const customerInfo = await purchases.getCustomerInfo();

      // Check for "pro" entitlement (configure this in RevenueCat dashboard)
      const isPro = customerInfo.entitlements.active["Dumpster Pro"] !== undefined;

      setState((prev) => ({ ...prev, isPro, loading: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchOfferings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !RC_API_KEY) return null;

      const purchases = getPurchases(session.user.id);
      const offerings = await purchases.getOfferings();
      setState((prev) => ({ ...prev, offerings }));
      return offerings;
    } catch (err) {
      return null;
    }
  }, []);

  const purchase = useCallback(async (rcPackage: any, email?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !RC_API_KEY) throw new Error("Not logged in");

    const purchases = getPurchases(session.user.id);
    const result = await purchases.purchase({
      rcPackage,
      customerEmail: email || session.user.email,
    });

    // Refresh entitlements after purchase
    await checkEntitlements();
    return result;
  }, [checkEntitlements]);

  useEffect(() => {
    checkEntitlements();
  }, [checkEntitlements]);

  return {
    ...state,
    checkEntitlements,
    fetchOfferings,
    purchase,
  };
}
