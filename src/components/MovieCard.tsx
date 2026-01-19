import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface MovieCardProps {
  id: string;
  title: string;
  posterUrl?: string;
  year?: number;
  score?: number;
  isVerified?: boolean;
  size?: "small" | "medium" | "large";
}

export function MovieCard({ 
  id, 
  title, 
  posterUrl, 
  year, 
  score, 
  isVerified = false,
  size = "medium" 
}: MovieCardProps) {
  const sizeClasses = {
    small: "w-28 h-40",
    medium: "w-36 h-52",
    large: "w-44 h-64",
  };

  return (
    <Link to={`/movie/${id}`}>
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden bg-muted flex-shrink-0 group cursor-pointer`}
      >
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <span className="text-4xl">🎬</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* Verified badge */}
        {isVerified && (
          <div className="absolute top-2 right-2 bg-secondary/90 rounded-full p-1">
            <CheckCircle className="w-3 h-3 text-secondary-foreground" />
          </div>
        )}
        
        {/* Score badge */}
        {score !== undefined && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-bold text-foreground">{score}</span>
          </div>
        )}
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h4 className="text-sm font-display text-foreground truncate">{title}</h4>
          {year && <p className="text-xs text-muted-foreground">{year}</p>}
        </div>
      </motion.div>
    </Link>
  );
}
