import { motion } from "framer-motion";
import { Search as SearchIcon, SlidersHorizontal, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { MovieListItem } from "@/components/MovieListItem";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MovieResult {
  id: string;
  title: string;
  poster_url: string | null;
  release_year: number | null;
  status: "purgatory" | "verified";
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "verified" | "purgatory">("all");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMovies = useCallback(async (searchQuery: string, filter: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      let queryBuilder = supabase
        .from("movies")
        .select("*")
        .ilike("title", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (filter === "verified") {
        queryBuilder = queryBuilder.eq("status", "verified");
      } else if (filter === "purgatory") {
        queryBuilder = queryBuilder.eq("status", "purgatory");
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      console.error("Error searching movies:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMovies(query, activeFilter);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, activeFilter, searchMovies]);

  return (
    <AppLayout>
      <div className="py-6 space-y-6 pt-safe" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display text-primary text-center"
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
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
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
          {!hasSearched ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Start typing to discover the worst cinema has to offer.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="glass-dark rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No trash found. Maybe it's not bad enough?
              </p>
            </div>
          ) : (
            results.map((movie, index) => (
              <MovieListItem
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster_url || undefined}
                year={movie.release_year || undefined}
                isVerified={movie.status === "verified"}
                index={index}
              />
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Search;
