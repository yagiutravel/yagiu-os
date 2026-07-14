"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GlobalSearchProvider>
        {children}
        <GlobalSearchModal />
      </GlobalSearchProvider>
    </ToastProvider>
  );
}
