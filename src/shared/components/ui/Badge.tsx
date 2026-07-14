import type { ReactNode } from "react";
import { profiloBadgeBase } from "@/lib/clienti/profilo-ui";

type BadgeVariant = "default" | "success" | "warning" | "info";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 text-zinc-600 ring-zinc-500/10",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/15",
  info: "bg-sky-50 text-sky-700 ring-sky-600/15",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={`${profiloBadgeBase} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
