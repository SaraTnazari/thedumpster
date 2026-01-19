import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CountdownCard } from "@/components/CountdownCard";
import { MovieCard } from "@/components/MovieCard";
import { MovieListItem } from "@/components/MovieListItem";
import { Link } from "react-router-dom";

// Mock data - will be replaced with real data
const topTrashMovies = [
  { id: "1", title: "The Room", posterUrl: "", year: 2003, score: 9.8, isVerified: true },
  { id: "2", title: "Birdemic", posterUrl: "", year: 2010, score: 9.5, isVerified: true },
  { id: "3", title: "Troll 2", posterUrl: "", year: 1990, score: 9.3, isVerified: true },
  { id: "4", title: "Manos", posterUrl: "", year: 1966, score: 9.1, isVerified: true },
];

const freshGarbage = [
  { id: "5", title: "Plan 9 From Outer Space", year: 1957, score: 8.7, isVerified: true },
  { id: "6", title: "Fateful Findings", year: 2013, score: 8.5, isVerified: false },
  { id: "7", title: "Miami Connection", year: 1987, score: 8.2, isVerified: true },
];

const Index = () => {
  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        {/* Countdown Hero */}
        <CountdownCard />

        {/* Top Trash Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display text-foreground">Top Trash Right Now</h2>
            </div>
            <Link to="/leaderboard" className="flex items-center gap-1 text-sm text-primary hover:underline">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {topTrashMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <MovieCard {...movie} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Fresh Garbage Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗑️</span>
            <h2 className="text-xl font-display text-foreground">Fresh Garbage</h2>
          </div>
          
          <div className="space-y-2">
            {freshGarbage.map((movie, index) => (
              <MovieListItem key={movie.id} {...movie} index={index} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl gradient-fire p-[1px]"
        >
          <div className="bg-card rounded-2xl p-6 text-center space-y-4">
            <h3 className="text-xl font-display text-foreground">Join Dumpster</h3>
            <p className="text-sm text-muted-foreground">
              Rate movies, write reviews, and help decide the worst of cinema.
            </p>
            <Link
              to="/auth"
              className="inline-block px-8 py-3 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default Index;
