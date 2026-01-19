import { Home, Trophy, PlusCircle, User } from "lucide-react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/leaderboard", icon: Trophy, label: "Top Trash" },
  { to: "/post", icon: PlusCircle, label: "Add" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-4 right-4 z-50 glass-nav rounded-2xl max-w-md mx-auto"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300 rounded-xl ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_hsl(342,100%,50%)]' : ''}`} />
                </motion.div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
              </>
            )}
          </RouterNavLink>
        ))}
      </div>
    </motion.nav>
  );
}
