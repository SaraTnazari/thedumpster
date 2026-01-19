import { motion } from "framer-motion";
import { PlusCircle, Lock, ImagePlus, Film, Calendar, Link as LinkIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Post = () => {
  // This will be replaced with real auth state
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl gradient-fire p-[1px]"
          >
            <div className="bg-card rounded-2xl p-8 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display text-foreground">Login Required</h3>
              <p className="text-sm text-muted-foreground">
                You need to sign in before you can add movies to Dumpster.
              </p>
              <Link
                to="/auth"
                className="inline-block px-8 py-3 gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-display text-primary text-center glow-pink"
        >
          Add to Dumpster
        </motion.h2>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Poster Upload */}
          <div className="rounded-2xl gradient-fire p-[1px]">
            <div className="bg-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-muted/50 transition-colors">
              <ImagePlus className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click to upload poster</p>
              <p className="text-xs text-muted-foreground/60">or paste a URL below</p>
            </div>
          </div>

          {/* Movie Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4" /> Movie Title
            </label>
            <Input
              type="text"
              placeholder="The Room, Birdemic, etc."
              className="h-12 bg-card border-border focus:border-primary rounded-xl"
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Release Year
            </label>
            <Input
              type="number"
              placeholder="2003"
              min="1900"
              max="2030"
              className="h-12 bg-card border-border focus:border-primary rounded-xl"
            />
          </div>

          {/* Poster URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Poster URL (optional)
            </label>
            <Input
              type="url"
              placeholder="https://..."
              className="h-12 bg-card border-border focus:border-primary rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add to Purgatory
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Movies start in Purgatory and need 5 community votes to become Verified Trash.
          </p>
        </motion.form>
      </div>
    </AppLayout>
  );
};

export default Post;
