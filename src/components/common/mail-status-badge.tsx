import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MailSendStatus } from "@/types/reservation";

type MailDisplayStatus = MailSendStatus | "not_sent";

const mailStatusLabels: Record<MailDisplayStatus, string> = {
  not_sent: "未送信",
  pending: "送信待ち",
  sent: "送信済み",
  failed: "送信失敗",
};

const mailStatusClasses: Record<MailDisplayStatus, string> = {
  not_sent: "border-rose-300 bg-rose-100 text-rose-900",
  pending: "border-amber-300 bg-amber-100 text-amber-900",
  sent: "border-sky-300 bg-sky-100 text-sky-900",
  failed: "border-red-300 bg-red-100 text-red-900",
};

type MailStatusBadgeProps = {
  status?: MailSendStatus | null;
  className?: string;
};

export function MailStatusBadge({ status, className }: MailStatusBadgeProps) {
  const displayStatus = status ?? "not_sent";

  return (
    <Badge
      variant="outline"
      className={cn(mailStatusClasses[displayStatus], className)}
    >
      {mailStatusLabels[displayStatus]}
    </Badge>
  );
}
