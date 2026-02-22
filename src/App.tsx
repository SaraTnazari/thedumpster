import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { StatusBar, Style } from '@capacitor/status-bar';
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import HallOfShame from "./pages/HallOfShame";
import MyBadges from "./pages/MyBadges";
import UserHistory from "./pages/UserHistory";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Leaderboard from "./pages/Leaderboard";
import MovieDetail from "./pages/MovieDetail";
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import UserProfile from "./pages/UserProfile";
import BillingSettings from "./pages/BillingSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle auth state and redirects
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is authenticated and on auth/signup page, redirect to home
      if (session && (location.pathname === "/auth" || location.pathname === "/signup")) {
        navigate("/", { replace: true });
      }
      
      setLoading(false);
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && (location.pathname === "/auth" || location.pathname === "/signup")) {
        navigate("/", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  // Configure Status Bar on app start
  useEffect(() => {
    const configureStatusBar = async () => {
      try {
        // 1. Force the app to sit BELOW the status bar, not behind it.
        await StatusBar.setOverlaysWebView({ overlay: false });
        // 2. Make the status bar solid black to match the app.
        await StatusBar.setBackgroundColor({ color: '#000000' });
        // 3. Ensure the text is light (white time/battery icons).
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (err) {
        console.log('Status Bar plugin not available on web', err);
      }
    };
    configureStatusBar();
  }, []);

  // Reset scroll position when keyboard closes (on input blur)
  useEffect(() => {
    const handleBlur = (e: FocusEvent) => {
      // Check if the blurred element is an input, textarea, or select
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        // Small delay to ensure keyboard is fully closed
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    // Listen for blur events on the document
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthGuard>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/post" element={<Post />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/history" element={<UserHistory />} />
                <Route path="/hall-of-shame" element={<HallOfShame />} />
                <Route path="/badges" element={<MyBadges />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/billing" element={<BillingSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGuard>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
