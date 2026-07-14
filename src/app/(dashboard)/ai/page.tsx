import { PageHeader } from "@/components/layout/PageHeader";
import { AiAssistantView } from "@/components/ai-assistant/AiAssistantView";

export default function AiAssistantPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="AI Assistant"
        description="Assistente operativo collegato ai dati di clienti, tour, pagamenti e dashboard."
      />
      <AiAssistantView />
    </div>
  );
}
