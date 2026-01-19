import { motion } from "framer-motion";
import { Search as SearchIcon, Filter, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { MovieListItem } from "@/components/MovieListItem";
import { useState } from "react";

const mockResults = [
  { id: "1", title: "The Room", year: 2003, score: 9.8, isVerified: true },
  { id: "2", title: "Birdemic: Shock and Terror", year: 2010, score: 9.5, isVerified: true },
  { id: "3", title: "Troll 2", year: 1990, score: 9.3, isVerified: true },
  { id: "4", title: "Manos: The Hands of Fate", year: 1966, score: 9.1, isVerified: true },
  { id: "5", title: "Plan 9 From Outer Space", year: 1957, score: 8.9, isVerified: true },
];

const Search = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "purgatory">("all");

  const filteredResults = mockResults.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display text-primary text-center glow-pink"
        >
          Search Dumpster
        </motion.h2>
        
        {/* Search Input */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find terrible movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-12 h-12 bg-card border-border focus:border-primary rounded-xl text-foreground"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Filter Pills */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          {[
            { key: "all", label: "All Movies" },
            { key: "verified", label: "Verified Trash" },
            { key: "purgatory", label: "Purgatory" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? "gradient-fire text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Results */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          {query === "" ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Start typing to discover the worst cinema has to offer.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No trash found. Maybe it's not bad enough?
              </p>
            </div>
          ) : (
            filteredResults.map((movie, index) => (
              <MovieListItem key={movie.id} {...movie} index={index} />
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Search;
