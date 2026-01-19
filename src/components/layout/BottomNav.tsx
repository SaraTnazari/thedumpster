import { Home, Search, PlusCircle, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/post", icon: PlusCircle, label: "Post" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-muted-foreground transition-all duration-200 hover:text-primary"
            activeClassName="text-primary neon-glow"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
