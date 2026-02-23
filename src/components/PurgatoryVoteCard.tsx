import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PurgatoryVoteCardProps {
  movieId: string;
}

export function PurgatoryVoteCard({ movieId }: PurgatoryVoteCardProps) {
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [upCount, setUpCount] = useState(0);
  const [downCount, setDownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        // Get vote counts
        const { data: votes } = await supabase
          .from("purgatory_votes")
          .select("vote_type")
          .eq("movie_id", movieId);

        const ups = votes?.filter(v => v.vote_type === "up").length || 0;
        const downs = votes?.filter(v => v.vote_type === "down").length || 0;
        setUpCount(ups);
        setDownCount(downs);

        // Get user's vote
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: myVote } = await supabase
            .from("purgatory_votes")
            .select("vote_type")
            .eq("movie_id", movieId)
            .eq("user_id", session.user.id)
            .maybeSingle();

          setUserVote(myVote?.vote_type as "up" | "down" | null);
        }
      } catch {
        // Failed to load votes
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [movieId]);

  const handleVote = async (voteType: "up" | "down") => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to vote.",
        variant: "destructive",
      });
      return;
    }

    setVoting(true);
    try {
      if (userVote === voteType) {
        // Remove vote
        await supabase
          .from("purgatory_votes")
          .delete()
          .eq("movie_id", movieId)
          .eq("user_id", session.user.id);

        setUserVote(null);
        if (voteType === "up") setUpCount(c => c - 1);
        else setDownCount(c => c - 1);
      } else {
        // Upsert vote
        await supabase
          .from("purgatory_votes")
          .upsert({
            movie_id: movieId,
            user_id: session.user.id,
            vote_type: voteType,
          }, { onConflict: "user_id,movie_id" });

        // Update counts
        if (userVote === "up") setUpCount(c => c - 1);
        if (userVote === "down") setDownCount(c => c - 1);
        if (voteType === "up") setUpCount(c => c + 1);
        else setDownCount(c => c + 1);
        setUserVote(voteType);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit vote.",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const total = upCount + downCount;
  const approvalPercent = total > 0 ? Math.round((upCount / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-4 space-y-3"
    >
      <div className="text-center">
        <p className="text-sm font-display text-yellow-400 uppercase tracking-wider">
          Purgatory Vote
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Does this belong in the Dumpster? {upCount >= 5 ? "Almost verified!" : `${5 - upCount} more votes to verify`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote("up")}
          disabled={voting}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            userVote === "up"
              ? "bg-green-500/20 text-green-400 border border-green-500/50"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <ThumbsUp className={`w-6 h-6 ${userVote === "up" ? "fill-green-400" : ""}`} />
          <span className="text-sm font-display">{upCount}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVote("down")}
          disabled={voting}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            userVote === "down"
              ? "bg-red-500/20 text-red-400 border border-red-500/50"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <ThumbsDown className={`w-6 h-6 ${userVote === "down" ? "fill-red-400" : ""}`} />
          <span className="text-sm font-display">{downCount}</span>
        </motion.button>
      </div>

      {total > 0 && (
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${approvalPercent}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {approvalPercent}% say it's trash ({total} votes)
          </p>
        </div>
      )}
    </motion.div>
  );
}
