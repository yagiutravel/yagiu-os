type PageContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContent({ children, className = "" }: PageContentProps) {
  return (
    <div
      className={`relative z-0 min-h-0 flex-1 overflow-y-auto bg-[#f7f7f8] px-6 py-4 ${className}`}
    >
      {children}
    </div>
  );
}
