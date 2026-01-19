import { PlusCircle, Lock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const Post = () => {
  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <h2 className="text-2xl font-display text-primary text-center">
          Dump a Movie
        </h2>
        
        <div className="glass-dark rounded-lg p-8 text-center space-y-4 border border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-display text-foreground">Login Required</h3>
          <p className="text-sm text-muted-foreground">
            You need to sign in before you can add movies to the dumpster.
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display tracking-wider rounded hover:neon-box-glow transition-all duration-300"
          >
            Sign In
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default Post;
