type AvatarSize = "sm" | "md" | "lg" | "xl";

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "h-8 w-8", text: "text-[10px]" },
  md: { container: "h-10 w-10", text: "text-xs" },
  lg: { container: "h-14 w-14", text: "text-sm" },
  xl: { container: "h-[72px] w-[72px]", text: "text-lg" },
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = getInitials(name) || "?";
  const { container, text } = sizeClasses[size];

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-50 to-zinc-100 font-semibold text-zinc-600 ring-2 ring-white shadow-sm ${container} ${text} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
