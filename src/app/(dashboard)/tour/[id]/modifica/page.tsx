import { TourFormView } from "@/components/tour/TourFormView";

type ModificaTourPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModificaTourPage({ params }: ModificaTourPageProps) {
  const { id } = await params;
  return <TourFormView mode="edit" tourId={id} />;
}
