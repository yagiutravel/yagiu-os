import { PageContent } from "@/shared/components/layout/PageContent";
import { Spinner } from "@/shared/components/ui/Spinner";

export default function DashboardLoading() {
  return (
    <PageContent>
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className="h-5 w-5" />
        <span className="sr-only">Caricamento in corso…</span>
      </div>
    </PageContent>
  );
}
