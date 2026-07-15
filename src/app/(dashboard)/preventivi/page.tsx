import { PreventiviView } from "@/components/preventivi/PreventiviView";

export default function PreventiviPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-zinc-200/60 bg-white/90 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Preventivi</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Crea, invia e converti preventivi collegati a clienti e tour.
          </p>
        </div>
      </header>
      <PreventiviView />
    </div>
  );
}
