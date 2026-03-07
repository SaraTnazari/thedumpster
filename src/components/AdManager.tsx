import { useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { showBannerAd, hideBannerAd, removeBannerAd } from "@/lib/admob";

/**
 * Manages ad visibility based on subscription status.
 * Pro users don't see ads. Free users see a banner ad at the bottom.
 */
export function AdManager() {
  const { isPro, loading } = useSubscription();

  useEffect(() => {
    if (loading) return;

    if (isPro) {
      removeBannerAd();
    } else {
      showBannerAd();
    }

    return () => {
      hideBannerAd();
    };
  }, [isPro, loading]);

  return null; // This component doesn't render anything
}
