import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface MovieListItemProps {
  id: string;
  title: string;
  posterUrl?: string;
  year?: number;
  score?: number;
  isVerified?: boolean;
  index?: number;
}

export function MovieListItem({ 
  id, 
  title, 
  posterUrl, 
  year, 
  score, 
  isVerified = false,
  index = 0
}: MovieListItemProps) {
  return (
    <Link to={`/movie/${id}`}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ x: 5 }}
        className="flex items-center gap-4 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors cursor-pointer group"
      >
        {/* Thumbnail */}
        <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-foreground truncate">{title}</h4>
            {isVerified && (
              <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
            )}
          </div>
          {year && <p className="text-sm text-muted-foreground">{year}</p>}
        </div>
        
        {/* Score */}
        {score !== undefined && (
          <div className="flex items-center gap-1 bg-primary/20 rounded-full px-3 py-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-bold text-primary">{score}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
