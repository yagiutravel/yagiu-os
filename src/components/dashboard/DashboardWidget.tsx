import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type DashboardWidgetProps = {
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardWidget({
  title,
  description,
  href,
  children,
  className = "",
}: DashboardWidgetProps) {
  return (
    <Card className={`transition-all duration-200 ${className}`}>
      <CardHeader
        title={title}
        description={description}
        action={
          href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
            >
              Apri
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : undefined
        }
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
