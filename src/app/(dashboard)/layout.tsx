import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppProviders } from "@/components/providers/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <DashboardLayout>{children}</DashboardLayout>
    </AppProviders>
  );
}
