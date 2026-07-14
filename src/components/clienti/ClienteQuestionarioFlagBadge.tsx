import { Badge } from "@/components/ui/Badge";

type ClienteQuestionarioFlagBadgeProps = {
  label: string;
  active: boolean;
};

export function ClienteQuestionarioFlagBadge({
  label,
  active,
}: ClienteQuestionarioFlagBadgeProps) {
  return (
    <Badge variant={active ? "success" : "default"}>
      {label}: {active ? "Sì" : "No"}
    </Badge>
  );
}
