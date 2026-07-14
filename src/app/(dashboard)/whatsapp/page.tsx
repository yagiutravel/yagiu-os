import { PageHeader } from "@/components/layout/PageHeader";
import { WhatsAppView } from "@/components/whatsapp/WhatsAppView";

export default function WhatsAppPage() {
  return (
    <>
      <PageHeader
        title="WhatsApp"
        description="Centro messaggi WhatsApp con i viaggiatori."
      />
      <WhatsAppView />
    </>
  );
}
