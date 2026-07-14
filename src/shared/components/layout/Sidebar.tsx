"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-200/80 bg-white">
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-200/80 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white">
          Y
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">
            Yagiu OS
          </p>
          <p className="truncate text-[11px] text-zinc-500">Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-zinc-900" : "text-zinc-400"
                }`}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200/80 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
            MM
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-zinc-900">
              Martin Marangella
            </p>
            <p className="truncate text-[11px] text-zinc-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
