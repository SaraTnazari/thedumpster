import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skull, Mail, Lock, User, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Validation schemas
const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

const emailSchema = z.string()
  .trim()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

// Sanitize username from email (fallback)
const sanitizeUsernameFromEmail = (email: string): string => {
  const localPart = email.split("@")[0] || "";
  return localPart.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateInputs = (): { isValid: boolean; finalUsername: string } => {
    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Invalid email",
        description: emailResult.error.errors[0].message,
        variant: "destructive",
      });
      return { isValid: false, finalUsername: "" };
    }

    // For signup, validate or sanitize username
    if (!isLogin) {
      if (username.trim()) {
        const usernameResult = usernameSchema.safeParse(username.trim());
        if (!usernameResult.success) {
          setUsernameError(usernameResult.error.errors[0].message);
          toast({
            title: "Invalid username",
            description: usernameResult.error.errors[0].message,
            variant: "destructive",
          });
          return { isValid: false, finalUsername: "" };
        }
        setUsernameError(null);
        return { isValid: true, finalUsername: username.trim() };
      } else {
        // Sanitize from email if no username provided
        const sanitized = sanitizeUsernameFromEmail(email);
        return { isValid: true, finalUsername: sanitized };
      }
    }

    return { isValid: true, finalUsername: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { isValid, finalUsername } = validateInputs();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back, trash panda!",
          description: "You've successfully signed in.",
        });
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").insert({
            user_id: data.user.id,
            username: finalUsername,
          });
        }

        toast({
          title: "Welcome to Dumpster!",
          description: "Your journey into cinematic trash begins now.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-pulse-glow"
          >
            <Skull className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-gothic text-primary glow-pink">
            Dumpster
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Welcome back, connoisseur of trash" : "Join the garbage collectors"}
          </p>
        </div>

        {/* Form */}
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="rounded-2xl gradient-fire p-[1px]"
        >
          <div className="bg-card rounded-2xl p-6 space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="TrashConnoisseur69"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError(null);
                    }}
                    maxLength={20}
                    className={`pl-10 bg-muted border-border focus:border-primary rounded-xl ${usernameError ? 'border-destructive' : ''}`}
                  />
                  {usernameError && (
                    <p className="text-xs text-destructive mt-1">{usernameError}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-muted border-border focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-muted border-border focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-fire text-primary-foreground font-display text-lg tracking-wider rounded-xl hover:box-glow-pink transition-all duration-300 h-12"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Enter Dumpster"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </motion.form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "New to Dumpster?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
