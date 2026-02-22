import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, X, Check, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [open]);

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not logged in");

      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({ plan: "pro", status: "active", updated_at: new Date().toISOString() })
          .eq("user_id", session.user.id);
      } else {
        await supabase
          .from("user_subscriptions")
          .insert({ user_id: session.user.id, plan: "pro", status: "active" });
      }

      localStorage.setItem('isProUser', 'true');
      window.dispatchEvent(new Event('localStorageChange'));
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    } catch (error: any) {
      console.error("Purchase error:", error);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border p-0 overflow-hidden">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent"
              >
                <Crown className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-display text-primary"
              >
                Welcome to the Club!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                You're now a Pro member. Enjoy unlimited reviews, see what others are trashing, and unlock premium badges!
              </motion.p>
              <Button
                onClick={handleClose}
                className="w-full h-14 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                Done
              </Button>
            </motion.div>
          ) : (
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

              <p className="text-center text-xs text-muted-foreground">
                Cancel anytime from your Billing settings
              </p>
            </motion.div>
          )}
      </DialogContent>
    </Dialog>
  );
}
