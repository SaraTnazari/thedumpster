import { motion } from "framer-motion";
import { User, LogIn, FileText, Vote, Star, Award, Settings } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";

const Profile = () => {
  // This will be replaced with real auth state
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <div className="py-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display text-foreground">Not Signed In</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Create an account to track your reviews and earn badges as a trash connoisseur.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-3 gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        {/* Avatar & Identity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-neon-purple p-[2px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <User className="w-10 h-10 text-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-foreground">TrashPanda42</h2>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/20 border border-primary/30">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Trash Connoisseur</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: FileText, label: "Scrolls Written", value: "12" },
            { icon: Vote, label: "Purgatory Votes", value: "45" },
            { icon: Star, label: "Movies Rated", value: "28" },
          ].map((stat, index) => (
            <div key={stat.label} className="glass-dark rounded-xl p-4 text-center space-y-2">
              <stat.icon className="w-5 h-5 text-primary mx-auto" />
              <div className="text-2xl font-display text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Menu */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          {[
            { icon: Award, label: "Hall of Shame", to: "/hall-of-shame" },
            { icon: Star, label: "My Badges", to: "/badges" },
            { icon: Settings, label: "Edit Profile", to: "/settings" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-foreground">{item.label}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
