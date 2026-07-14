import type { DashboardGreeting } from "@/types/dashboard";

type DashboardHeaderProps = {
  greeting: DashboardGreeting;
};

export function DashboardHeader({ greeting }: DashboardHeaderProps) {
  const emoji = greeting.saluto === "Buongiorno" ? "👋" : "";

  return (
    <header className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        {greeting.saluto} {greeting.nome}
        {emoji ? ` ${emoji}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 sm:text-base">
        Oggi hai{" "}
        <span className="font-medium text-zinc-900">
          {greeting.attivitaRichiedonoAttenzione} attività
        </span>{" "}
        che richiedono attenzione.
      </p>
    </header>
  );
}
