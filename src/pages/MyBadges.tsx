import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, Crown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useBadges } from "@/hooks/useBadges";
import { useSubscription } from "@/hooks/useSubscription";

const MyBadges = () => {
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { badges, loading, stats } = useBadges();
  const { isPro } = useSubscription();

  return (
    <AppLayout>
      {/* Fixed Back Button Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-display text-primary glow-pink">My Badges</h2>
          <p className="text-sm text-muted-foreground">
            Earn badges by reviewing movies and contributing to Dumpster
          </p>
          {stats && (
            <p className="text-xs text-muted-foreground">
              {stats.reviewCount} reviews written
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          /* Badges Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              const needsPro = badge.isPremium && !isPro && badge.qualified;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => {
                    if (needsPro || (badge.isPremium && !isPro)) {
                      setShowUpgrade(true);
                    }
                  }}
                  className={`rounded-2xl ${
                    needsPro || (badge.isPremium && !isPro) ? "cursor-pointer" : ""
                  } ${
                    !badge.unlocked && !needsPro ? "opacity-50" : ""
                  } ${
                    isPro && badge.unlocked
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 p-[2px] shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                      : "gradient-fire p-[1px]"
                  }`}
                >
                  <div className={`rounded-2xl p-6 text-center space-y-3 ${
                    isPro && badge.unlocked ? "bg-gradient-to-br from-yellow-50 to-yellow-100" : "bg-card"
                  }`}>
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                        isPro && badge.unlocked
                          ? "bg-gradient-to-br from-yellow-300 to-yellow-500"
                          : badge.unlocked
                          ? "bg-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${
                        isPro && badge.unlocked
                          ? "text-yellow-900"
                          : badge.unlocked
                          ? badge.color
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3
                        className={`font-display ${
                          isPro && badge.unlocked
                            ? "text-yellow-900"
                            : badge.unlocked
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {badge.name}
                      </h3>
                      <p className={`text-xs mt-1 ${
                        isPro && badge.unlocked ? "text-yellow-800" : "text-muted-foreground"
                      }`}>{badge.description}</p>
                    </div>

                    {/* Status */}
                    {badge.unlocked ? (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                        isPro
                          ? "bg-yellow-600/30 border border-yellow-600/50"
                          : "bg-primary/20"
                      }`}>
                        <span className={`text-xs font-medium ${
                          isPro ? "text-yellow-900" : "text-primary"
                        }`}>Unlocked</span>
                      </div>
                    ) : needsPro ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-500">Pro Required</span>
                      </div>
                    ) : badge.isPremium ? (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Premium</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                        <span className="text-xs text-muted-foreground">Locked</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      {showUpgrade && (
        <UpgradeModal
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
        />
      )}
    </AppLayout>
  );
};

export default MyBadges;
