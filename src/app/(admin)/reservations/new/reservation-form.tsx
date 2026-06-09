"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { createReservationAction } from "./actions";
import { initialFormState } from "./form-state";

export function ReservationForm() {
  const [state, formAction, isPending] = useActionState(
    createReservationAction,
    initialFormState,
  );
  const formState = state ?? initialFormState;
  const errors = formState.errors ?? {};
  const values = formState.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {errors.form ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.form}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="guestName"
          name="guestName"
          label="宿泊者名"
          placeholder="例: 山田 太郎"
          defaultValue={values.guestName}
          error={errors.guestName}
          required
        />
        <FormField
          id="guestEmail"
          name="guestEmail"
          label="メールアドレス"
          type="email"
          placeholder="guest@example.com"
          defaultValue={values.guestEmail}
          error={errors.guestEmail}
          required
        />
      </div>

      <FormField
        id="guestPhone"
        name="guestPhone"
        label="電話番号"
        type="tel"
        placeholder="例: 09012345678"
        defaultValue={values.guestPhone}
        error={errors.guestPhone}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id="checkinDate"
          name="checkinDate"
          label="チェックイン日"
          type="date"
          defaultValue={values.checkinDate}
          error={errors.checkinDate}
          required
        />
        <FormField
          id="checkoutDate"
          name="checkoutDate"
          label="チェックアウト日"
          type="date"
          defaultValue={values.checkoutDate}
          error={errors.checkoutDate}
          required
        />
        <FormField
          id="guestCount"
          name="guestCount"
          label="人数"
          type="number"
          min={1}
          step={1}
          placeholder="例: 2"
          defaultValue={values.guestCount}
          error={errors.guestCount}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="propertyName"
          name="propertyName"
          label="施設名"
          placeholder="例: 町家ステイ東山"
          defaultValue={values.propertyName}
          error={errors.propertyName}
          required
        />
        <FormField
          id="pinCode"
          name="pinCode"
          label="暗証番号"
          inputMode="numeric"
          placeholder="例: 1234"
          defaultValue={values.pinCode}
          error={errors.pinCode}
          helperText="4〜8桁の数字で入力してください。"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium leading-none">
          備考
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="到着予定時刻、連絡事項など"
          defaultValue={values.notes}
        />
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "保存中" : "登録する"}
        </Button>
      </div>
    </form>
  );
}
