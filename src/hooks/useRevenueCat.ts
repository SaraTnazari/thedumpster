import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isNative } from "@/lib/native";

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";

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

      let isPro = false;

      if (isNative) {
        // Use native Capacitor plugin on iOS
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        await Purchases.configure({
          apiKey: RC_API_KEY,
          appUserID: session.user.id,
        });
        const { customerInfo } = await Purchases.getCustomerInfo();
        isPro = customerInfo.entitlements.active["Dumpster Pro"] !== undefined;
      } else {
        // Use JS SDK on web
        const { Purchases } = await import("@revenuecat/purchases-js");
        const purchases = Purchases.configure(RC_API_KEY, session.user.id);
        const customerInfo = await purchases.getCustomerInfo();
        isPro = customerInfo.entitlements.active["Dumpster Pro"] !== undefined;
      }

      setState((prev) => ({ ...prev, isPro, loading: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchOfferings = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !RC_API_KEY) return null;

      let offerings: any = null;

      if (isNative) {
        const { Purchases } = await import("@revenuecat/purchases-capacitor");
        offerings = await Purchases.getOfferings();
      } else {
        const { Purchases } = await import("@revenuecat/purchases-js");
        const purchases = Purchases.configure(RC_API_KEY, session.user.id);
        offerings = await purchases.getOfferings({ currency: "USD" });
      }

      setState((prev) => ({ ...prev, offerings }));
      return offerings;
    } catch (err) {
      return null;
    }
  }, []);

  const purchase = useCallback(async (rcPackage: any, email?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user || !RC_API_KEY) throw new Error("Not logged in");

    if (isNative) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const result = await Purchases.purchasePackage({ aPackage: rcPackage });
      await checkEntitlements();
      return result;
    } else {
      const { Purchases } = await import("@revenuecat/purchases-js");
      const purchases = Purchases.configure(RC_API_KEY, session.user.id);
      const result = await purchases.purchase({
        rcPackage: rcPackage,
        customerEmail: email || session.user.email,
      });
      await checkEntitlements();
      return result;
    }
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
