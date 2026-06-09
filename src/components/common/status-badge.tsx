import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getReservationStatusLabel,
  type ReservationStatus,
} from "@/types/reservation";

export const reservationStatuses = [
  "registered",
  "pin_set",
  "mail_sent",
  "ready_for_checkin",
  "checked_in",
  "checked_out",
] as const satisfies readonly ReservationStatus[];

const statusClasses: Record<ReservationStatus, string> = {
  registered: "border-slate-300 bg-slate-100 text-slate-800",
  pin_set: "border-violet-300 bg-violet-100 text-violet-900",
  mail_sent: "border-sky-300 bg-sky-100 text-sky-900",
  ready_for_checkin: "border-amber-300 bg-amber-100 text-amber-900",
  checked_in: "border-emerald-300 bg-emerald-100 text-emerald-900",
  checked_out: "border-zinc-400 bg-zinc-200 text-zinc-900",
};

type StatusBadgeProps = {
  status: ReservationStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status], className)}>
      {getReservationStatusLabel(status)}
    </Badge>
  );
}
