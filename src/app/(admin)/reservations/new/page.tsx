import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationForm } from "./reservation-form";

export default function NewReservationPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="予約登録"
        description="必要な情報を1画面で入力し、チェックイン案内の準備を始めます。"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">予約情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationForm />
        </CardContent>
      </Card>
    </div>
  );
}
