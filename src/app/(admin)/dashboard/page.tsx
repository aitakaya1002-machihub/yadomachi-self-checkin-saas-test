import Link from "next/link";
import {
  AlertCircle,
  CalendarCheck,
  CalendarClock,
  LogOut,
  MailWarning,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { MailStatusBadge } from "@/components/common/mail-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listReservations, type ReservationListItem } from "@/lib/db/reservations";

export const dynamic = "force-dynamic";

const today = getTokyoDateString(0);
const upcomingEnd = getTokyoDateString(7);

export default async function DashboardPage() {
  const reservations = await loadReservations();
  const todayCheckins = reservations.filter((reservation) => reservation.checkin_date === today);
  const upcomingCheckins = reservations.filter(
    (reservation) =>
      reservation.checkin_date > today && reservation.checkin_date <= upcomingEnd,
  );
  const unsentReservations = reservations.filter(
    (reservation) => reservation.latest_mail_log?.send_status !== "sent",
  );
  const missingPinReservations = reservations.filter((reservation) => !reservation.pin_code);
  const checkoutReservations = reservations.filter(
    (reservation) => reservation.checkout_date === today,
  );

  const urgentCount = unsentReservations.length + missingPinReservations.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="今日の業務"
        description="チェックイン対応と未対応の確認から始めます。"
        actions={
          <Button asChild>
            <Link href="/reservations/new">
              <Plus className="mr-2 h-4 w-4" />
              予約を登録
            </Link>
          </Button>
        }
      />

      {urgentCount > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">未対応の予約があります</div>
            <div className="mt-1 text-sm">
              メール未送信 {unsentReservations.length}件・暗証番号未設定{" "}
              {missingPinReservations.length}件
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <WorkCard
          title="今日のチェックイン"
          count={todayCheckins.length}
          icon={CalendarCheck}
          tone="normal"
        />
        <WorkCard
          title="近日チェックイン"
          count={upcomingCheckins.length}
          icon={CalendarClock}
          tone="normal"
        />
        <WorkCard
          title="未送信予約"
          count={unsentReservations.length}
          icon={MailWarning}
          tone={unsentReservations.length > 0 ? "urgent" : "normal"}
        />
        <WorkCard
          title="暗証番号未設定"
          count={missingPinReservations.length}
          icon={ShieldAlert}
          tone={missingPinReservations.length > 0 ? "urgent" : "normal"}
        />
        <WorkCard
          title="チェックアウト予定"
          count={checkoutReservations.length}
          icon={LogOut}
          tone="normal"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <TaskSection
            title="今日のチェックイン"
            description="本日到着予定のゲストです。暗証番号と案内送信状況を確認してください。"
            reservations={todayCheckins}
            emptyTitle="今日のチェックインはありません"
          />
          <TaskSection
            title="近日チェックイン"
            description="7日以内にチェックイン予定の予約です。"
            reservations={upcomingCheckins}
            emptyTitle="近日チェックインはありません"
          />
          <TaskSection
            title="チェックアウト予定"
            description="本日チェックアウト予定の予約です。"
            reservations={checkoutReservations}
            emptyTitle="今日のチェックアウト予定はありません"
          />
        </div>

        <aside className="space-y-6">
          <TaskSection
            title="未送信予約"
            description="案内メールの送信が必要です。"
            reservations={unsentReservations}
            emptyTitle="未送信予約はありません"
            urgent
          />
          <TaskSection
            title="暗証番号未設定"
            description="暗証番号を設定してから案内メールを送ります。"
            reservations={missingPinReservations}
            emptyTitle="暗証番号未設定の予約はありません"
            urgent
          />
        </aside>
      </div>
    </div>
  );
}

async function loadReservations() {
  try {
    return await listReservations({
      sort: "checkin_date",
      direction: "asc",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("SUPABASE")) {
      return [];
    }

    throw error;
  }
}

function WorkCard({
  title,
  count,
  icon: Icon,
  tone,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "normal" | "urgent";
}) {
  return (
    <Card className={tone === "urgent" ? "border-rose-200 bg-rose-50" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-muted-foreground">{title}</div>
          <Icon className={tone === "urgent" ? "h-4 w-4 text-rose-700" : "h-4 w-4 text-muted-foreground"} />
        </div>
        <div className={tone === "urgent" ? "mt-3 text-3xl font-bold text-rose-900" : "mt-3 text-3xl font-bold"}>
          {count}
          <span className="ml-1 text-base font-medium">件</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskSection({
  title,
  description,
  reservations,
  emptyTitle,
  urgent = false,
}: {
  title: string;
  description: string;
  reservations: ReservationListItem[];
  emptyTitle: string;
  urgent?: boolean;
}) {
  return (
    <Card className={urgent && reservations.length > 0 ? "border-rose-200" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {urgent && reservations.length > 0 ? (
            <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-900">
              要対応
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reservations.length > 0 ? (
          reservations.slice(0, 5).map((reservation) => (
            <ReservationTaskRow
              key={reservation.id}
              reservation={reservation}
              urgent={
                urgent ||
                !reservation.pin_code ||
                reservation.latest_mail_log?.send_status !== "sent"
              }
            />
          ))
        ) : (
          <EmptyState title={emptyTitle} />
        )}
        {reservations.length > 5 ? (
          <Button asChild variant="outline" className="w-full">
            <Link href="/reservations">すべて確認</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReservationTaskRow({
  reservation,
  urgent,
}: {
  reservation: ReservationListItem;
  urgent: boolean;
}) {
  return (
    <Link
      href={`/reservations/${reservation.id}`}
      className={
        urgent
          ? "block rounded-md border border-rose-200 bg-rose-50 p-3 transition hover:bg-rose-100"
          : "block rounded-md border p-3 transition hover:bg-slate-50"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-medium">{reservation.guest_name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {formatDate(reservation.checkin_date)} - {formatDate(reservation.checkout_date)} /{" "}
            {reservation.property_name}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={reservation.status} />
          <MailStatusBadge status={reservation.latest_mail_log?.send_status} />
          {!reservation.pin_code ? (
            <span className="rounded-md border border-rose-300 bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-900">
              PIN未設定
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function getTokyoDateString(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00+09:00`));
}
