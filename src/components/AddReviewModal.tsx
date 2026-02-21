import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
}

export function AddReviewModal({ isOpen, onClose, onSubmit }: AddReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, reviewText);
      // Reset form
      setRating(0);
      setReviewText("");
      setHoveredRating(0);
      onClose();
    }
  };

  const handleTrashClick = (value: number) => {
    setRating(value);
  };

  const handleTrashHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleTrashLeave = () => {
    setHoveredRating(0);
  };

  const getTrashColor = (index: number) => {
    const value = index + 1;
    const activeRating = hoveredRating || rating;
    if (value <= activeRating) {
      return "text-primary"; // Red color
    }
    return "text-muted-foreground"; // Gray color
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="p-8 space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5 text-foreground" />
            <span className="sr-only">Close</span>
          </button>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display text-primary text-center"
          >
            Trash This Movie
          </motion.h2>

          {/* Rating System */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleTrashClick(value)}
                onMouseEnter={() => handleTrashHover(value)}
                onMouseLeave={handleTrashLeave}
                className="transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={`Rate ${value} out of 5`}
              >
                <Trash2
                  className={`w-10 h-10 transition-colors duration-200 ${getTrashColor(value - 1)}`}
                />
              </button>
            ))}
          </motion.div>

          {/* Review Text Input */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Why does this movie suck?"
              className="min-h-[150px] bg-muted border-border focus:border-primary rounded-xl resize-none text-foreground"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full h-14 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish Rant
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
