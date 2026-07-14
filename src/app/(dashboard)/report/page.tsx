import { PageHeader } from "@/components/layout/PageHeader";
import { ReportView } from "@/components/report/ReportView";

export default function ReportPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Report"
        description="KPI operativi e attività recenti del workspace."
      />
      <ReportView />
    </div>
  );
}
