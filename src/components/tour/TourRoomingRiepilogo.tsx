import { InfoGrid } from "@/components/ui/InfoGrid";
import type { RoomingRiepilogo } from "@/types/camera";

type TourRoomingRiepilogoProps = {
  riepilogo: RoomingRiepilogo;
};

export function TourRoomingRiepilogo({ riepilogo }: TourRoomingRiepilogoProps) {
  return (
    <InfoGrid
      columns={3}
      fields={[
        { label: "Camere", value: String(riepilogo.camere) },
        { label: "Partecipanti", value: String(riepilogo.partecipanti) },
        { label: "Posti occupati", value: String(riepilogo.postiOccupati) },
        { label: "Posti liberi", value: String(riepilogo.postiLiberi) },
        { label: "Camere complete", value: String(riepilogo.camereComplete) },
        {
          label: "Camere incomplete",
          value: String(riepilogo.camereIncomplete),
        },
      ]}
    />
  );
}
