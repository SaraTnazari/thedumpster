'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Trash2, Vote, Trophy, ChevronRight, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface Screen {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const screens: Screen[] = [
    {
      id: 1,
      title: 'Welcome to Dumpster',
      description: 'Rate the worst movies ever made. No filters, no mercy—just pure unfiltered trash.',
      icon: <Skull className="w-24 h-24 text-pink-500" />,
    },
    {
      id: 2,
      title: 'How It Works',
      description: 'Search for bad movies, rate them with trash cans, and write salty reviews to warn fellow cinephiles.',
      icon: <Trash2 className="w-24 h-24 text-pink-500" />,
    },
    {
      id: 3,
      title: 'Purgatory System',
      description: 'New movies enter Purgatory. Vote to verify them as certified trash and help the community decide.',
      icon: <Vote className="w-24 h-24 text-pink-500" />,
    },
    {
      id: 4,
      title: 'Join the Community',
      description: 'Follow trash connoisseurs, earn exclusive badges, and climb the leaderboard. Become a Dumpster legend.',
      icon: <Trophy className="w-24 h-24 text-pink-500" />,
    },
  ];

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('dumpster_onboarding_done');
    if (hasSeenOnboarding === 'true') {
      setIsVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('dumpster_onboarding_done', 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) {
    return null;
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 p-2 hover:bg-pink-500/20 rounded-full transition-colors"
        aria-label="Close onboarding"
      >
        <X className="w-6 h-6 text-pink-500" />
      </button>

      <div className="w-full max-w-2xl mx-auto px-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="flex flex-col items-center justify-center min-h-screen text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="p-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 shadow-lg shadow-pink-500/50">
                {screens[currentScreen].icon}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
            >
              {screens[currentScreen].title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl text-gray-300 max-w-md mb-12 leading-relaxed"
            >
              {screens[currentScreen].description}
            </motion.p>

            {/* Dot indicators */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex gap-2 mb-12"
            >
              {screens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPage([index, index > currentScreen ? 1 : -1]);
                    setCurrentScreen(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentScreen
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-8 shadow-lg shadow-pink-500/50'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to screen ${index + 1}`}
                />
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex gap-4 flex-col sm:flex-row items-center justify-center"
            >
              <button
                onClick={handleSkip}
                className="text-pink-500 hover:text-pink-400 transition-colors font-semibold"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-pink-500/50 hover:shadow-xl hover:shadow-pink-500/70"
              >
                {currentScreen === screens.length - 1 ? (
                  <>
                    Get Started <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
