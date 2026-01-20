import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10"
        >
          <Skull className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-6xl font-display text-primary glow-pink">404</h1>
        <p className="text-xl text-muted-foreground font-display">
          This garbage doesn't exist
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 gradient-fire text-primary-foreground font-display tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          Back to Dumpster
        </a>
      </motion.div>
    </div>
  );
};

export default NotFound;
