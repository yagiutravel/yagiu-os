"use client";

import { useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/auth";
import { navItems } from "@/lib/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { ROLE_BY_KEY } from "@/tenant/constants/roles.catalog";
import { workspaceRepository } from "@/tenant/repositories";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { profile, membership, tenantContext, isLoading } = useAuth();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  useEffect(() => {
    const workspaceId = tenantContext?.workspaceId;
    if (!workspaceId) {
      startTransition(() => {
        setWorkspaceName(null);
        setWorkspaceLoading(false);
      });
      return;
    }

    let cancelled = false;
    startTransition(() => setWorkspaceLoading(true));

    void workspaceRepository
      .findById(workspaceId)
      .then((workspace) => {
        if (!cancelled) {
          setWorkspaceName(workspace?.name ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaceName(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tenantContext?.workspaceId]);

  const displayName = profile?.displayName;
  const roleLabel = membership
    ? (ROLE_BY_KEY.get(membership.roleKey)?.name ?? membership.roleKey)
    : null;

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
          {workspaceLoading ? (
            <div className="mt-0.5 flex h-3 items-center">
              <Spinner className="h-2.5 w-2.5" />
            </div>
          ) : workspaceName ? (
            <p className="truncate text-[11px] text-zinc-500">{workspaceName}</p>
          ) : null}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Spinner className="h-4 w-4" />
          </div>
        ) : displayName ? (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-900">
                {displayName}
              </p>
              {roleLabel ? (
                <p className="truncate text-[11px] text-zinc-500">{roleLabel}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
