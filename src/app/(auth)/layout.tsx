import { AppProviders } from "@/components/providers/AppProviders";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProviders>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
        {children}
      </div>
    </AppProviders>
  );
}
