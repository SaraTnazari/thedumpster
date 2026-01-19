import { Flame, Star, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted animate-pulse-glow">
            <Flame className="w-10 h-10 text-secondary animate-flicker" />
          </div>
          <h2 className="text-3xl font-display tracking-wider">
            <span className="text-gradient-fire">The Bad Movie</span>
            <br />
            <span className="text-primary neon-glow">Database</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Celebrate cinema's greatest failures. Rate, review, and rescue movies from obscurity.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="glass-dark rounded-lg p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              <span className="text-2xl font-display">0</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Verified Trash</p>
          </div>
          <div className="glass-dark rounded-lg p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-secondary">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-display">0</span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">In Purgatory</p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="glass-dark rounded-lg p-6 text-center space-y-4 border border-primary/20">
          <h3 className="text-xl font-display text-primary">Join the Dumpster</h3>
          <p className="text-sm text-muted-foreground">
            Sign in to vote on movies, write reviews, and help curate the worst of cinema.
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded hover:neon-box-glow transition-all duration-300"
          >
            Get Started
          </a>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="space-y-4">
          <h3 className="text-lg font-display text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-secondary" />
            Fresh Garbage
          </h3>
          <div className="glass-dark rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No movies yet. Be the first to dump something terrible.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;
