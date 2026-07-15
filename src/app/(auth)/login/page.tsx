import { Suspense } from "react";
import { LoginView } from "@/components/auth/LoginView";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Caricamento…</div>}>
      <LoginView />
    </Suspense>
  );
}
