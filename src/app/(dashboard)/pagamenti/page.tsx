import { PageHeader } from "@/components/layout/PageHeader";
import { PagamentiOverviewView } from "@/components/pagamenti/PagamentiOverviewView";

export default function PagamentiPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Pagamenti"
        description="Traccia incassi, saldi in sospeso e pagamenti per tour."
      />
      <PagamentiOverviewView />
    </div>
  );
}
