"use client";

import { startTransition, useEffect, useState } from "react";

const DEFAULT_SHORTCUT_LABEL = "⌘K";

function resolveShortcutLabel(): string {
  return navigator.platform.toUpperCase().includes("MAC")
    ? "⌘K"
    : "Ctrl+K";
}

/**
 * Stable SSR/hydration label, then platform-specific value after mount.
 */
export function useKeyboardShortcutLabel(): string {
  const [label, setLabel] = useState(DEFAULT_SHORTCUT_LABEL);

  useEffect(() => {
    startTransition(() => {
      setLabel(resolveShortcutLabel());
    });
  }, []);

  return label;
}
