"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { GlobalSearchProvider } from "@/components/search/GlobalSearchProvider";
import { AuthProvider } from "@/auth/AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <GlobalSearchProvider>
          {children}
          <GlobalSearchModal />
        </GlobalSearchProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
