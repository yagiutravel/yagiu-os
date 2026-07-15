"use client";

import { useAuth } from "@/auth";
import { Spinner } from "@/components/ui/Spinner";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden [&>*]:flex [&>*]:min-h-0 [&>*]:flex-1 [&>*]:flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
