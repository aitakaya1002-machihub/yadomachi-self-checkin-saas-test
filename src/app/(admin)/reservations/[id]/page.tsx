import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { MailStatusBadge } from "@/components/common/mail-status-badge";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReservationDetailById } from "@/lib/db/reservations";
import { getMailSendStatusLabel } from "@/types/reservation";
import {
  MailActionForm,
  NotesForm,
  PinCodeForm,
  ReservationInfoForm,
  StatusForm,
} from "./detail-actions";

type ReservationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function ReservationDetailPage({
  params,
  searchParams,
}: ReservationDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const reservation = await getReservationDetailById(id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const guestUrl = `${appUrl}/guest/checkin/${reservation.guest_access_token}`;
  const hasSentMail = reservation.mail_logs.some((mailLog) => mailLog.send_status === "sent");

  return (
    <div className="space-y-6">
      {query?.created === "1" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          予約を登録しました。この画面で暗証番号、メール送信、備考まで続けて管理できます。
        </div>
      ) : null}

      <PageHeader
        title={`${reservation.guest_name} 様の予約`}
        description="予約の確認、案内メール、暗証番号、ステータス更新をこの画面で行います。"
        actions={
          <Button asChild variant="outline">
            <Link href="/reservations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              一覧へ戻る
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryCard label="ステータス">
          <StatusBadge status={reservation.status} />
        </SummaryCard>
        <SummaryCard label="暗証番号">
          <span className="font-mono text-lg font-semibold">{reservation.pin_code ?? "未設定"}</span>
        </SummaryCard>
        <SummaryCard label="メール送信">
          <MailStatusBadge status={reservation.mail_logs[0]?.send_status} />
        </SummaryCard>
        <SummaryCard label="宿泊日">
          <span className="text-sm font-medium">
            {formatDate(reservation.checkin_date)} - {formatDate(reservation.checkout_date)}
          </span>
        </SummaryCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">予約情報</CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationInfoForm reservation={reservation} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">メール送信履歴</CardTitle>
            </CardHeader>
            <CardContent>
              {reservation.mail_logs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>状態</TableHead>
                      <TableHead>件名</TableHead>
                      <TableHead>送信日時</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservation.mail_logs.map((mailLog) => (
                      <TableRow key={mailLog.id}>
                        <TableCell>
                          <MailStatusBadge status={mailLog.send_status} />
                        </TableCell>
                        <TableCell className="max-w-[360px] truncate">{mailLog.subject}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {mailLog.sent_at
                            ? formatDateTime(mailLog.sent_at)
                            : getMailSendStatusLabel(mailLog.send_status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">まだ案内メールは送信されていません。</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">備考</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesForm reservationId={reservation.id} notes={reservation.notes} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">主要操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <MailActionForm
                reservationId={reservation.id}
                hasSentMail={hasSentMail}
                status={reservation.status}
              />
              <div className="rounded-md border bg-slate-50 p-3">
                <div className="text-sm font-medium">ゲストURL</div>
                <p className="mt-1 break-all text-sm text-muted-foreground">{guestUrl}</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={guestUrl} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    ゲスト画面を開く
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">暗証番号変更</CardTitle>
            </CardHeader>
            <CardContent>
              <PinCodeForm reservationId={reservation.id} pinCode={reservation.pin_code} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ステータス更新</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusForm reservationId={reservation.id} status={reservation.status} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
