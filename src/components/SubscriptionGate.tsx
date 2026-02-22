import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

export function SubscriptionGate({
  children,
  fallbackMessage = "Upgrade to Pro to unlock this feature",
}: SubscriptionGateProps) {
  const { isPro, loading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isPro) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl gradient-fire p-[1px]"
        >
          <div className="bg-card rounded-2xl p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-display text-foreground">Pro Feature</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {fallbackMessage}
            </p>
            <Button
              onClick={() => setShowUpgrade(true)}
              className="gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro — $2.99/mo
            </Button>
          </div>
        </motion.div>
        {showUpgrade && (
          <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
        )}
      </>
    );
  }

  return <>{children}</>;
}
