import { AlertTriangle, CalendarDays, KeyRound, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReservationByGuestToken } from "@/lib/db/reservations";
import { getSettings } from "@/lib/db/settings";

type GuestCheckinPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function GuestCheckinPage({ params }: GuestCheckinPageProps) {
  const { token } = await params;
  const { reservation, settings } = await loadGuestCheckinData(token);

  if (!reservation) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-xl">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-bold text-slate-950">
              チェックイン情報が見つかりません
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              URLが正しいか、案内メールに記載されたリンクをもう一度ご確認ください。
            </p>
          </div>
        </div>
      </main>
    );
  }

  const checkinGuide = [settings?.checkin_guide_text, reservation.checkin_time_note]
    .filter(Boolean)
    .join("\n\n");
  const cautionText = settings?.caution_text || "ご滞在中は近隣の方へご配慮ください。";
  const emergencyContact =
    reservation.emergency_contact || settings?.emergency_contact || "施設へお問い合わせください。";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto max-w-xl space-y-4">
        <header className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-primary">チェックイン案内</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950">
            {reservation.property_name}
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-700">
            {reservation.guest_name} 様
          </p>
        </header>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="h-5 w-5 text-primary" />
              暗証番号
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 px-5 py-5 text-center">
              <div className="font-mono text-4xl font-bold tracking-widest text-white">
                {reservation.pin_code ?? "未設定"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays className="h-5 w-5 text-primary" />
              宿泊日
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-lg">
            <InfoRow label="チェックイン" value={formatDate(reservation.checkin_date)} />
            <InfoRow label="チェックアウト" value={formatDate(reservation.checkout_date)} />
            <InfoRow label="人数" value={`${reservation.guest_count}名`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              チェックイン方法
            </CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-lg leading-8 text-slate-800">
            {checkinGuide || "玄関のキーボックスに暗証番号を入力し、鍵を取り出してください。"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              注意事項
            </CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-lg leading-8 text-slate-800">
            {cautionText}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Phone className="h-5 w-5 text-primary" />
              緊急連絡先
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{emergencyContact}</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

async function loadGuestCheckinData(token: string) {
  try {
    const [reservation, settings] = await Promise.all([
      getReservationByGuestToken(token),
      getSettings(),
    ]);

    return { reservation, settings };
  } catch {
    return { reservation: null, settings: null };
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-base text-muted-foreground">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00+09:00`));
}
