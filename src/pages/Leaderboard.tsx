import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MovieListItem } from "@/components/MovieListItem";

// Mock data
const topThree = [
  { id: "2", title: "Birdemic", posterUrl: "", year: 2010, score: 9.5, rank: 2 },
  { id: "1", title: "The Room", posterUrl: "", year: 2003, score: 9.8, rank: 1 },
  { id: "3", title: "Troll 2", posterUrl: "", year: 1990, score: 9.3, rank: 3 },
];

const honorableMentions = [
  { id: "4", title: "Manos: The Hands of Fate", year: 1966, score: 9.1, isVerified: true },
  { id: "5", title: "Plan 9 From Outer Space", year: 1957, score: 8.9, isVerified: true },
  { id: "6", title: "Fateful Findings", year: 2013, score: 8.7, isVerified: true },
  { id: "7", title: "Miami Connection", year: 1987, score: 8.5, isVerified: true },
  { id: "8", title: "Samurai Cop", year: 1991, score: 8.3, isVerified: true },
];

const PodiumCard = ({ movie, position }: { movie: typeof topThree[0], position: "left" | "center" | "right" }) => {
  const isCenter = position === "center";
  const positionStyles = {
    left: "order-1 h-32",
    center: "order-2 h-44",
    right: "order-3 h-28",
  };
  
  const rankColors = {
    1: "from-primary to-neon-purple",
    2: "from-zinc-400 to-zinc-600",
    3: "from-amber-600 to-amber-800",
  };

  const RankIcon = movie.rank === 1 ? Crown : movie.rank === 2 ? Medal : Award;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (position === "center" ? 0 : 0.2) }}
      className={`flex flex-col items-center ${positionStyles[position]}`}
    >
      {/* Movie poster */}
      <motion.div 
        whileHover={{ scale: 1.05, y: -5 }}
        className={`relative ${isCenter ? 'w-28 h-40' : 'w-20 h-28'} rounded-xl overflow-hidden bg-muted mb-2 ${isCenter ? 'box-glow-pink' : ''}`}
      >
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-card">
          <span className={`${isCenter ? 'text-4xl' : 'text-2xl'}`}>🎬</span>
        </div>
        
        {/* Rank badge */}
        <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[movie.rank as keyof typeof rankColors]} flex items-center justify-center shadow-lg`}>
          <span className="text-sm font-bold text-white">{movie.rank}</span>
        </div>
      </motion.div>

      {/* Title */}
      <h4 className={`font-display text-center ${isCenter ? 'text-base text-primary glow-pink' : 'text-sm text-foreground'} line-clamp-2`}>
        {movie.title}
      </h4>
      <p className="text-xs text-muted-foreground">{movie.year}</p>
      
      {/* Score */}
      <div className={`flex items-center gap-1 mt-1 ${isCenter ? 'text-primary' : 'text-muted-foreground'}`}>
        <span className="text-lg font-display">{movie.score}</span>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  // Reorder for visual display: 2nd, 1st, 3rd
  const orderedTop = [topThree[0], topThree[1], topThree[2]];

  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display text-primary glow-pink">Top Trash</h1>
          <p className="text-sm text-muted-foreground">The worst of the worst, ranked by you</p>
        </motion.div>

        {/* Podium */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Podium stands */}
          <div className="flex items-end justify-center gap-4 mt-8">
            <PodiumCard movie={orderedTop[0]} position="left" />
            <PodiumCard movie={orderedTop[1]} position="center" />
            <PodiumCard movie={orderedTop[2]} position="right" />
          </div>
          
          {/* Podium base */}
          <div className="flex items-end justify-center gap-1 mt-4">
            <div className="w-24 h-12 rounded-t-lg bg-gradient-to-b from-zinc-700 to-zinc-800 flex items-center justify-center">
              <span className="text-2xl font-display text-zinc-400">2</span>
            </div>
            <div className="w-28 h-16 rounded-t-lg gradient-fire flex items-center justify-center">
              <span className="text-3xl font-display text-white">1</span>
            </div>
            <div className="w-24 h-10 rounded-t-lg bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center">
              <span className="text-2xl font-display text-amber-300">3</span>
            </div>
          </div>
        </motion.div>

        {/* Honorable Mentions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-display text-foreground">Honorable Mentions</h2>
          </div>
          
          <div className="space-y-2">
            {honorableMentions.map((movie, index) => (
              <div key={movie.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-display text-muted-foreground">
                  {index + 4}
                </span>
                <div className="flex-1">
                  <MovieListItem {...movie} index={index} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
