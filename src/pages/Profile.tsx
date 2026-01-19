import { User, LogIn } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const Profile = () => {
  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <h2 className="text-2xl font-display text-primary text-center">
          Your Profile
        </h2>
        
        <div className="glass-dark rounded-lg p-8 text-center space-y-4 border border-border">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-display text-foreground">Not Signed In</h3>
          <p className="text-sm text-muted-foreground">
            Create an account to track your reviews and join the community of bad movie enthusiasts.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display tracking-wider rounded hover:neon-box-glow transition-all duration-300"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </a>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
