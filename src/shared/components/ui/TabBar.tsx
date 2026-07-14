export type TabBarItem<T extends string = string> = {
  id: T;
  label: string;
};

type TabBarProps<T extends string> = {
  items: TabBarItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  className?: string;
};

export function TabBar<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel = "Sezioni",
  className = "",
}: TabBarProps<T>) {
  return (
    <nav
      aria-label={ariaLabel}
      className={`-mx-1 flex gap-1 overflow-x-auto border-b border-zinc-100 ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative shrink-0 rounded-t-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
            {isActive && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-zinc-900 transition-all duration-200" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
