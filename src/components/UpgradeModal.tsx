import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Crown, X, Check, Loader2, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isNative } from "@/lib/native";

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || "";
const PRIVACY_POLICY_URL = "https://saranazari.github.io/thedumpster/privacy-policy.html";
const TERMS_OF_USE_URL = "https://saranazari.github.io/thedumpster/terms-of-use.html";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const purchaseContainerRef = useRef<HTMLDivElement>(null);

  const benefits = [
    "Unlimited Reviews (no daily limit)",
    "See Other Users' Reviews",
    "Follow Other Users' Activity",
    "Premium Badges & Golden Profile",
  ];

  useEffect(() => {
    if (open) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [open]);

  /** Native iOS purchase via RevenueCat Capacitor plugin (StoreKit) */
  const handleNativePurchase = async () => {
    setIsProcessing(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Not signed in",
          description: "Please sign in to upgrade.",
          variant: "destructive",
        });
        return;
      }

      // Configure the native SDK
      await Purchases.configure({
        apiKey: RC_API_KEY,
        appUserID: session.user.id,
      });

      // Fetch offerings from StoreKit
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings?.current;

      if (!currentOffering || currentOffering.availablePackages.length === 0) {
        toast({
          title: "Subscription not available yet",
          description: "Payment is being set up. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      const pkg = currentOffering.availablePackages[0];

      // This triggers the native Apple StoreKit purchase sheet
      await Purchases.purchasePackage({ aPackage: pkg });

      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is now active.",
      });
      onOpenChange(false);
    } catch (err: any) {
      // RevenueCat returns userCancelled flag when user dismisses the sheet
      if (err?.userCancelled) {
        // User cancelled — do nothing
        return;
      }
      toast({
        title: "Purchase failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /** Web purchase via RevenueCat JS SDK */
  const handleRevenueCatWebPurchase = async () => {
    setIsProcessing(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-js");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Not signed in",
          description: "Please sign in to upgrade.",
          variant: "destructive",
        });
        return;
      }

      const purchases = Purchases.configure(RC_API_KEY, session.user.id);
      const offerings = await purchases.getOfferings({ currency: "USD" });
      const currentOffering = offerings?.current;

      if (!currentOffering || currentOffering.availablePackages.length === 0) {
        toast({
          title: "Subscription not available yet",
          description: "Payment is being set up. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      const pkg = currentOffering.availablePackages[0];
      await purchases.purchase({
        rcPackage: pkg,
        customerEmail: session.user.email || undefined,
      });

      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is now active.",
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Purchase failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePurchase = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not logged in");

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.message || "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handlePurchase = () => {
    if (isNative) {
      // On iOS, use the native Capacitor plugin (StoreKit)
      handleNativePurchase();
    } else if (RC_API_KEY) {
      // On web with RC key, use the JS SDK
      handleRevenueCatWebPurchase();
    } else {
      // Fallback to Stripe on web
      handleStripePurchase();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsProcessing(false);
  };

  const openLink = async (url: string) => {
    if (isNative) {
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url });
      } catch {
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 space-y-6"
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>

          <div className="text-center space-y-4 pt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent"
            >
              <Crown className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h2 className="text-3xl font-display text-primary">Go Pro</h2>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <p className="text-foreground font-medium">{benefit}</p>
              </motion.div>
            ))}
          </div>

          {/* Subscription details (required by Apple Guideline 3.1.2) */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Dumpster Pro — Auto-Renewable Subscription
            </p>
            <p className="text-xs text-muted-foreground">
              $2.99/month. Payment will be charged to your Apple ID account at confirmation of purchase.
              Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
              Your account will be charged for renewal within 24 hours prior to the end of the current period.
              You can manage and cancel your subscriptions by going to your App Store account settings after purchase.
            </p>
          </div>

          {/* RevenueCat mount point */}
          <div ref={purchaseContainerRef} id="rc-purchase-container" />

          <Button
            disabled={isProcessing}
            className="w-full h-14 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            onClick={handlePurchase}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Upgrade to Pro — $2.99/mo"
            )}
          </Button>

          {/* Legal links (required by Apple Guideline 3.1.2) */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => openLink(TERMS_OF_USE_URL)}
              className="text-xs text-muted-foreground hover:text-primary underline flex items-center gap-1"
            >
              Terms of Use <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-xs text-muted-foreground">|</span>
            <button
              onClick={() => openLink(PRIVACY_POLICY_URL)}
              className="text-xs text-muted-foreground hover:text-primary underline flex items-center gap-1"
            >
              Privacy Policy <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment. Cancel anytime.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
