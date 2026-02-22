import { motion } from "framer-motion";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";

interface FollowButtonProps {
  targetUserId: string;
  compact?: boolean;
}

export function FollowButton({ targetUserId, compact = false }: FollowButtonProps) {
  const { isFollowing, loading, toggleFollow } = useFollows(targetUserId);

  if (loading) {
    return (
      <Button disabled size={compact ? "sm" : "default"} variant="outline" className="rounded-xl">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFollow();
        }}
        size={compact ? "sm" : "default"}
        className={
          isFollowing
            ? "rounded-xl bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all"
            : "rounded-xl gradient-fire text-primary-foreground hover:box-glow-pink transition-all"
        }
      >
        {isFollowing ? (
          <>
            <UserMinus className="w-4 h-4 mr-1" />
            {!compact && "Unfollow"}
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-1" />
            {!compact && "Follow"}
          </>
        )}
      </Button>
    </motion.div>
  );
}
