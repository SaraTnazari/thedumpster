import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Skull, Flame } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownCard() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set target to New Year's Eve of current year
    const getTargetDate = () => {
      const now = new Date();
      return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    };

    const calculateTimeLeft = () => {
      const difference = getTargetDate().getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl gradient-fire p-[1px]"
    >
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Skull className="w-6 h-6 text-primary" />
          <Flame className="w-5 h-5 text-secondary animate-pulse" />
        </div>
        
        <div className="text-center space-y-1">
          <h3 className="text-xl font-display text-primary tracking-wider">
            Shittiest Movie of the Year
          </h3>
          <p className="text-sm text-muted-foreground">The Grand Reveal</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {timeUnits.map((unit, index) => (
            <motion.div 
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="bg-muted rounded-xl py-3 px-2">
                <span className="text-2xl font-display text-foreground">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 block">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
