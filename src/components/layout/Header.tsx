import { Flame } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-border">
      <div className="flex items-center justify-center h-14 px-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Flame className="w-8 h-8 text-secondary animate-flicker" />
            <Flame className="w-8 h-8 text-primary absolute top-0 left-0 opacity-50 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display tracking-widest text-foreground">
            <span className="text-primary neon-glow">DUMPSTER</span>
          </h1>
        </div>
      </div>
    </header>
  );
}
