import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="flex items-center justify-center h-14 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-gothic text-primary glow-pink"
        >
          The Scroll
        </motion.h1>
      </div>
    </header>
  );
}
