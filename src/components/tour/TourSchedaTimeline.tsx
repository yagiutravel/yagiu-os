import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Timeline } from "@/components/ui/Timeline";
import { getTimelineTourPlaceholder } from "@/lib/tour/timeline-tour.data";

type TourSchedaTimelineProps = {
  tourId: string;
};

export function TourSchedaTimeline({ tourId }: TourSchedaTimelineProps) {
  const eventi = getTimelineTourPlaceholder(tourId);

  return (
    <Card>
      <CardHeader
        title="Timeline del Tour"
        description="Cronologia eventi, attività operative e comunicazioni del tour."
      />
      <CardContent>
        <Timeline eventi={eventi} />
      </CardContent>
    </Card>
  );
}
