import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-14 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
