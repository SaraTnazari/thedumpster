import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./FollowButton";

interface UserCardProps {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  followersCount?: number;
  reviewCount?: number;
  showFollowButton?: boolean;
  index?: number;
}

export function UserCard({
  userId,
  username,
  avatarUrl,
  followersCount = 0,
  reviewCount = 0,
  showFollowButton = true,
  index = 0,
}: UserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/user/${userId}`}
        className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors"
      >
        {/* Avatar */}
        <Avatar className="h-12 w-12 border border-border">
          <AvatarImage src={avatarUrl || undefined} alt={username || "User"} />
          <AvatarFallback>
            <User className="w-6 h-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-foreground truncate">
            {username || "Anonymous"}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{followersCount} followers</span>
            <span>{reviewCount} reviews</span>
          </div>
        </div>

        {/* Follow Button */}
        {showFollowButton && <FollowButton targetUserId={userId} compact />}
      </Link>
    </motion.div>
  );
}
