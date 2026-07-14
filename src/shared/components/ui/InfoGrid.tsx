import type { ReactNode } from "react";

export type InfoFieldItem = {
  label: string;
  value: string;
  badge?: ReactNode;
};

type InfoGridProps = {
  fields: InfoFieldItem[];
  columns?: 2 | 3;
};

const columnClasses: Record<2 | 3, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

export function InfoGrid({ fields, columns = 2 }: InfoGridProps) {
  return (
    <dl className={`grid gap-4 ${columnClasses[columns]}`}>
      {fields.map((field) => (
        <div
          key={field.label}
          className="rounded-xl bg-zinc-50/60 px-4 py-3.5 ring-1 ring-inset ring-zinc-200/50 transition-colors duration-200 hover:bg-white"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {field.label}
          </dt>
          <dd className="mt-1.5 text-sm font-medium text-zinc-900">
            {field.badge ?? (
              <span className={field.value === "—" ? "font-normal text-zinc-400" : undefined}>
                {field.value}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
