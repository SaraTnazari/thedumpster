import { Home, Trophy, Search, User } from "lucide-react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: Home },
  { to: "/leaderboard", icon: Trophy },
  { to: "/post", icon: Search },
  { to: "/profile", icon: User },
];

export function BottomNav() {
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <RouterNavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center justify-center w-full h-full transition-all duration-300 rounded-xl ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center"
              >
                <item.icon 
                  className={`w-8 h-8 ${
                    isActive 
                      ? 'text-primary glow-pink drop-shadow-[0_0_8px_hsl(342,100%,50%)]' 
                      : ''
                  }`} 
                />
              </motion.div>
            )}
          </RouterNavLink>
        ))}
      </div>
    </motion.nav>
  );
}
