import Link from "next/link";
import { AlertCircle, ArrowDown, ArrowUp, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { MailStatusBadge } from "@/components/common/mail-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listReservations,
  type ReservationListItem,
  type ReservationSortKey,
  type SortDirection,
} from "@/lib/db/reservations";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ReservationsPageProps = {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    direction?: string;
  }>;
};

const sortKeys = [
  "checkin_date",
  "checkout_date",
  "guest_name",
  "guest_count",
  "property_name",
  "status",
] as const satisfies readonly ReservationSortKey[];

const sortableHeaders: {
  key: ReservationSortKey;
  label: string;
  className?: string;
}[] = [
  { key: "guest_name", label: "宿泊者名" },
  { key: "checkin_date", label: "チェックイン日" },
  { key: "checkout_date", label: "チェックアウト日" },
  { key: "guest_count", label: "人数" },
  { key: "property_name", label: "施設名" },
  { key: "status", label: "ステータス" },
];

export default async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const sort = parseSortKey(params?.sort);
  const direction = parseDirection(params?.direction);
  const { reservations, errorMessage } = await loadReservations({ query, sort, direction });
  const hasUnresolvedReservations = reservations.some(isUnresolvedReservation);

  return (
    <div className="space-y-6">
      <PageHeader
        title="予約一覧"
        description="手動登録した予約を表形式で確認します。"
        actions={
          <Button asChild>
            <Link href="/reservations/new">
              <Plus className="mr-2 h-4 w-4" />
              予約を登録
            </Link>
          </Button>
        }
      />

      {hasUnresolvedReservations ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          未送信または準備中の予約があります。ステータスとメール送信状況を確認してください。
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">予約一覧を取得できませんでした</div>
            <div className="mt-1 text-sm">{errorMessage}</div>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-lg">予約</CardTitle>
          <form className="flex w-full gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                className="pl-9"
                placeholder="宿泊者名・施設名・予約番号で検索"
                aria-label="予約検索"
              />
            </div>
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="direction" value={direction} />
            <Button type="submit" variant="outline">
              検索
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {!errorMessage && reservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {sortableHeaders.map((header) => (
                    <TableHead key={header.key} className={header.className}>
                      <SortLink
                        label={header.label}
                        sortKey={header.key}
                        currentSort={sort}
                        currentDirection={direction}
                        query={query}
                      />
                    </TableHead>
                  ))}
                  <TableHead>メール送信状況</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow
                    key={reservation.id}
                    className={cn(isUnresolvedReservation(reservation) && "bg-rose-50/60")}
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/reservations/${reservation.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {reservation.guest_name}
                      </Link>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {reservation.reservation_code}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reservation.checkin_date)}</TableCell>
                    <TableCell>{formatDate(reservation.checkout_date)}</TableCell>
                    <TableCell>{reservation.guest_count}名</TableCell>
                    <TableCell>{reservation.property_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={reservation.status} />
                    </TableCell>
                    <TableCell>
                      <MailStatusBadge status={reservation.latest_mail_log?.send_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !errorMessage ? (
            <EmptyState
              title={query ? "条件に一致する予約がありません" : "予約がまだありません"}
              description={
                query
                  ? "検索条件を変更して、もう一度確認してください。"
                  : "最初の予約を登録すると、ここに一覧で表示されます。"
              }
              action={
                <Button asChild>
                  <Link href="/reservations/new">予約を登録</Link>
                </Button>
              }
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

async function loadReservations({
  query,
  sort,
  direction,
}: {
  query: string;
  sort: ReservationSortKey;
  direction: SortDirection;
}) {
  try {
    return {
      reservations: await listReservations({ query, sort, direction }),
      errorMessage: null,
    };
  } catch (error) {
    return {
      reservations: [],
      errorMessage: error instanceof Error ? error.message : "不明なエラーが発生しました。",
    };
  }
}

function SortLink({
  label,
  sortKey,
  currentSort,
  currentDirection,
  query,
}: {
  label: string;
  sortKey: ReservationSortKey;
  currentSort: ReservationSortKey;
  currentDirection: SortDirection;
  query: string;
}) {
  const isActive = currentSort === sortKey;
  const nextDirection: SortDirection = isActive && currentDirection === "asc" ? "desc" : "asc";
  const href = {
    pathname: "/reservations",
    query: {
      ...(query ? { q: query } : {}),
      sort: sortKey,
      direction: nextDirection,
    },
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground",
        isActive && "text-foreground",
      )}
    >
      {label}
      {isActive ? (
        currentDirection === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : null}
    </Link>
  );
}

function parseSortKey(value: string | undefined): ReservationSortKey {
  if (sortKeys.includes(value as ReservationSortKey)) {
    return value as ReservationSortKey;
  }

  return "checkin_date";
}

function parseDirection(value: string | undefined): SortDirection {
  return value === "desc" ? "desc" : "asc";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

function isUnresolvedReservation(reservation: ReservationListItem) {
  return (
    reservation.status === "registered" ||
    reservation.status === "pin_set" ||
    reservation.latest_mail_log?.send_status !== "sent"
  );
}
