import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <main
        className="flex-1 overflow-y-auto pb-24 px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
