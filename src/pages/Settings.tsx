import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");

  // Load saved name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("displayName");
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("displayName", displayName);
    
    // Show success toast
    toast({
      title: "Saved!",
      description: "Your profile has been updated.",
    });
  };

  return (
    <AppLayout>
      {/* Fixed Back Button Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md pt-safe"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors p-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      <div className="pt-20 pb-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-display text-primary">Who are you?</h2>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Display Name
            </label>
            <Input
              type="text"
              placeholder="The Trashman"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-muted border-border focus:border-primary rounded-xl text-foreground"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-14 gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300"
          >
            Save Profile
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Settings;
