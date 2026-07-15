"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/auth/auth.service";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function RecuperaPasswordView() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setMessage("Controlla la tua email per il link di reimpostazione password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Richiesta non riuscita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="Recupera password"
        description="Riceverai un link per impostare una nuova password."
        action={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
            <KeyRound className="h-4 w-4" strokeWidth={1.75} />
          </div>
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>

          {message ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Invio in corso…" : "Invia link"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          <Link href="/login" className="text-zinc-900 underline-offset-2 hover:underline">
            Torna al login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
