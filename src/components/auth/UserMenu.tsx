"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/auth";
import { ROLE_BY_KEY } from "@/tenant/constants/roles.catalog";

export function UserMenu() {
  const { profile, membership, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const displayName = profile?.displayName || "Utente";
  const roleLabel = membership
    ? ROLE_BY_KEY.get(membership.roleKey)?.name ?? membership.roleKey
    : "Membro";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Chiudi menu"
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
            <div className="border-b border-zinc-100 px-2 py-2">
              <p className="truncate text-sm font-medium text-zinc-900">{displayName}</p>
              <p className="truncate text-xs text-zinc-500">{profile?.email}</p>
              <p className="mt-1 text-xs text-zinc-400">{roleLabel}</p>
            </div>
            <Link
              href="/impostazioni"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <Settings className="h-4 w-4" />
              Impostazioni account
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
