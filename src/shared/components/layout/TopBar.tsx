"use client";

import { NotificationCenter } from "@/components/notifiche/NotificationCenter";
import { GlobalSearchTrigger } from "@/components/search/GlobalSearchTrigger";
import { UserMenu } from "@/components/auth/UserMenu";

export function TopBar() {
  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-sm sm:gap-4 sm:px-6">
      <GlobalSearchTrigger />
      <div className="ml-auto flex items-center gap-2">
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
}
