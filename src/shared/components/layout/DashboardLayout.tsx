import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
