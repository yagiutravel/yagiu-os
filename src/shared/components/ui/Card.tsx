import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

type CardContentProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
