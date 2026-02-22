import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Crown, Check, CreditCard, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/UpgradeModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const BillingSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { plan, isPro, loading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Handle Stripe redirect back
  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    if (success === "true" && sessionId) {
      setVerifying(true);
      // Verify the payment and activate Pro
      const verifyPayment = async () => {
        try {
          const response = await fetch("/api/verify-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();

          if (data.success && data.userId) {
            // Update subscription in Supabase
            const { data: existingSub } = await supabase
              .from("user_subscriptions")
              .select("id")
              .eq("user_id", data.userId)
              .maybeSingle();

            if (existingSub) {
              await supabase
                .from("user_subscriptions")
                .update({
                  plan: "pro",
                  status: "active",
                  stripe_customer_id: data.customerId,
                  stripe_subscription_id: data.subscriptionId,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", data.userId);
            } else {
              await supabase
                .from("user_subscriptions")
                .insert({
                  user_id: data.userId,
                  plan: "pro",
                  status: "active",
                  stripe_customer_id: data.customerId,
                  stripe_subscription_id: data.subscriptionId,
                });
            }

            localStorage.setItem("isProUser", "true");
            window.dispatchEvent(new Event("localStorageChange"));

            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });

            toast({
              title: "Welcome to Pro!",
              description: "Your subscription is now active. Enjoy unlimited features!",
            });
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          toast({
            title: "Verification issue",
            description: "Payment received. Your account will be updated shortly.",
          });
        } finally {
          setVerifying(false);
          // Clean up URL
          navigate("/billing", { replace: true });
        }
      };

      verifyPayment();
    }
  }, [searchParams, navigate, toast]);

  const freeFeatures = [
    "5 reviews per day",
    "Basic profile",
    "View leaderboard",
    "Search movies",
  ];

  const proFeatures = [
    "Unlimited reviews",
    "See other users' reviews",
    "Follow other users' activity",
    "Premium badges",
    "Golden profile styling",
  ];

  if (loading || verifying) {
    return (
      <AppLayout>
        <div className="py-6 flex flex-col items-center justify-center min-h-[200px] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          {verifying && (
            <p className="text-sm text-muted-foreground">Verifying your payment...</p>
          )}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <CreditCard className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-2xl font-display text-primary glow-pink">Billing & Plan</h2>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl gradient-fire p-[1px]"
        >
          <div className="bg-card rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-foreground text-lg">Current Plan</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPro
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isPro ? "PRO" : "FREE"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? "You have unlimited access to all Dumpster features."
                : "You're on the free plan with 5 reviews per day."}
            </p>
          </div>
        </motion.div>

        {/* Plans Comparison */}
        <div className="space-y-4">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl p-[1px] ${!isPro ? "gradient-fire" : "bg-border"}`}
          >
            <div className="bg-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-foreground text-lg">Free</h3>
                <span className="text-2xl font-display text-foreground">$0</span>
              </div>
              <div className="space-y-2">
                {freeFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div className="text-center text-xs text-muted-foreground pt-2">
                  Your current plan
                </div>
              )}
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl p-[1px] ${isPro ? "gradient-fire" : "bg-border"}`}
          >
            <div className="bg-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-display text-foreground text-lg">Pro</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-display text-foreground">$2.99</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="space-y-2">
                {proFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {!isPro && (
                <Button
                  onClick={() => setShowUpgrade(true)}
                  className="w-full gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              {isPro && (
                <div className="text-center text-xs text-primary font-medium pt-2">
                  Your current plan
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {showUpgrade && (
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      )}
    </AppLayout>
  );
};

export default BillingSettings;
