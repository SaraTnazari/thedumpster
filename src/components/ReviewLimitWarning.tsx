import { motion } from "framer-motion";
import { AlertTriangle, Zap } from "lucide-react";
import { useReviewLimit } from "@/hooks/useReviewLimit";

interface ReviewLimitWarningProps {
  onUpgrade?: () => void;
}

export function ReviewLimitWarning({ onUpgrade }: ReviewLimitWarningProps) {
  const { reviewsToday, dailyLimit, canReview, loading, remainingToday } = useReviewLimit();

  if (loading || dailyLimit === Infinity) return null;

  // Don't show if user hasn't started reviewing today
  if (reviewsToday === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-3 flex items-center justify-between ${
        canReview
          ? "bg-muted border border-border"
          : "bg-destructive/10 border border-destructive/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {canReview ? (
          <Zap className="w-4 h-4 text-primary" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
        <span className="text-sm text-foreground">
          {canReview
            ? `${reviewsToday}/${dailyLimit} free reviews used today`
            : "Daily review limit reached"}
        </span>
      </div>
      {(!canReview || remainingToday <= 2) && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="text-xs font-medium text-primary hover:underline"
        >
          Go Pro
        </button>
      )}
    </motion.div>
  );
}
