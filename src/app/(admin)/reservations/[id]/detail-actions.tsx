"use client";

import { useActionState } from "react";
import { Mail, RotateCw, Save } from "lucide-react";
import { FormField } from "@/components/common/form-field";
import { StatusBadge, reservationStatuses } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { ReservationStatus } from "@/types/reservation";
import {
  sendGuideMailAction,
  updateNotesAction,
  updatePinCodeAction,
  updateReservationInfoAction,
  updateStatusAction,
} from "./actions";

type ActionState = {
  ok: boolean;
  message: string;
};

const initialState: ActionState = {
  ok: false,
  message: "",
};

type ReservationInfoFormProps = {
  reservation: {
    id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    checkin_date: string;
    checkout_date: string;
    guest_count: number;
    property_name: string;
  };
};

export function ReservationInfoForm({ reservation }: ReservationInfoFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateReservationInfoAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservation.id} />
      <ActionMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="guestName"
          label="宿泊者名"
          defaultValue={reservation.guest_name}
          required
        />
        <FormField
          name="guestEmail"
          label="メールアドレス"
          type="email"
          defaultValue={reservation.guest_email}
          required
        />
      </div>
      <FormField
        name="guestPhone"
        label="電話番号"
        type="tel"
        defaultValue={reservation.guest_phone ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          name="checkinDate"
          label="チェックイン日"
          type="date"
          defaultValue={reservation.checkin_date}
          required
        />
        <FormField
          name="checkoutDate"
          label="チェックアウト日"
          type="date"
          defaultValue={reservation.checkout_date}
          required
        />
        <FormField
          name="guestCount"
          label="人数"
          type="number"
          min={1}
          defaultValue={reservation.guest_count}
          required
        />
      </div>
      <FormField
        name="propertyName"
        label="施設名"
        defaultValue={reservation.property_name}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "保存中" : "予約情報を保存"}
        </Button>
      </div>
    </form>
  );
}

export function PinCodeForm({
  reservationId,
  pinCode,
}: {
  reservationId: string;
  pinCode: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updatePinCodeAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      <ActionMessage state={state} />
      <FormField
        name="pinCode"
        label="暗証番号"
        inputMode="numeric"
        defaultValue={pinCode ?? ""}
        placeholder="例: 1234"
        helperText="4〜8桁の数字で入力してください。"
        required
      />
      <Button type="submit" disabled={isPending}>
        <Save className="mr-2 h-4 w-4" />
        {isPending ? "更新中" : "暗証番号を変更"}
      </Button>
    </form>
  );
}

export function StatusForm({
  reservationId,
  status,
}: {
  reservationId: string;
  status: ReservationStatus;
}) {
  const [state, formAction, isPending] = useActionState(updateStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      <ActionMessage state={state} />
      <div className="flex flex-wrap gap-2">
        {reservationStatuses.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <input
              type="radio"
              name="status"
              value={item}
              defaultChecked={item === status}
              className="h-4 w-4"
            />
            <StatusBadge status={item} />
          </label>
        ))}
      </div>
      <Button type="submit" disabled={isPending}>
        <Save className="mr-2 h-4 w-4" />
        {isPending ? "更新中" : "ステータスを更新"}
      </Button>
    </form>
  );
}

export function NotesForm({
  reservationId,
  notes,
}: {
  reservationId: string;
  notes: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateNotesAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      <ActionMessage state={state} />
      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium leading-none">
          備考
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={notes ?? ""}
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="ゲスト対応メモ、到着予定、注意事項など"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        <Save className="mr-2 h-4 w-4" />
        {isPending ? "保存中" : "備考を保存"}
      </Button>
    </form>
  );
}

export function MailActionForm({
  reservationId,
  hasSentMail,
  status,
}: {
  reservationId: string;
  hasSentMail: boolean;
  status: ReservationStatus;
}) {
  const [state, formAction, isPending] = useActionState(sendGuideMailAction, initialState);
  const Icon = hasSentMail ? RotateCw : Mail;
  const needsPinCode = status === "registered";

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="reservationId" value={reservationId} />
      <ActionMessage state={state} />
      {needsPinCode ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          先に暗証番号を設定してください。
        </p>
      ) : null}
      <Button type="submit" disabled={isPending || needsPinCode} className="w-full sm:w-auto">
        <Icon className="mr-2 h-4 w-4" />
        {isPending ? "送信中" : hasSentMail ? "案内メールを再送" : "案内メールを送信"}
      </Button>
    </form>
  );
}

function ActionMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={
        state.ok
          ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      }
    >
      {state.message}
    </div>
  );
}
