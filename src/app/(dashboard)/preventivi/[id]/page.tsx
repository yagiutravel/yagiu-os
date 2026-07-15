import { PreventivoFormView } from "@/components/preventivi/PreventivoFormView";

type PreventivoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PreventivoDetailPage({ params }: PreventivoDetailPageProps) {
  const { id } = await params;
  return <PreventivoFormView mode="edit" preventivoId={id} />;
}
