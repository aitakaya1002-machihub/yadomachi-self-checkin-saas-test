"use server";

import { redirect } from "next/navigation";
import { createReservation } from "@/lib/db/reservations";
import type { ReservationInsert } from "@/types/reservation";

export type ReservationFormErrors = Partial<
  Record<
    | "guestName"
    | "guestEmail"
    | "guestPhone"
    | "checkinDate"
    | "checkoutDate"
    | "guestCount"
    | "propertyName"
    | "notes"
    | "pinCode"
    | "form",
    string
  >
>;

export type ReservationFormState = {
  errors: ReservationFormErrors;
  values: Record<string, string>;
};

const initialFormState: ReservationFormState = {
  errors: {},
  values: {},
};

export async function createReservationAction(
  _prevState: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const values = getFormValues(formData);
  const errors = validateReservation(values);

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const reservation: ReservationInsert = {
    guest_name: values.guestName,
    guest_email: values.guestEmail,
    guest_phone: values.guestPhone || null,
    checkin_date: values.checkinDate,
    checkout_date: values.checkoutDate,
    guest_count: Number(values.guestCount),
    property_name: values.propertyName,
    reservation_code: createReservationCode(),
    pin_code: values.pinCode,
    notes: values.notes || null,
    status: "pin_set",
  };

  let reservationId: string;

  try {
    const createdReservation = await createReservation(reservation);
    reservationId = createdReservation.id;
  } catch (error) {
    return {
      errors: {
        form:
          error instanceof Error
            ? `予約を保存できませんでした。${error.message}`
            : "予約を保存できませんでした。",
      },
      values,
    };
  }

  redirect(`/reservations/${reservationId}?created=1`);
}

export { initialFormState };

function getFormValues(formData: FormData) {
  return {
    guestName: getString(formData, "guestName"),
    guestEmail: getString(formData, "guestEmail"),
    guestPhone: getString(formData, "guestPhone"),
    checkinDate: getString(formData, "checkinDate"),
    checkoutDate: getString(formData, "checkoutDate"),
    guestCount: getString(formData, "guestCount"),
    propertyName: getString(formData, "propertyName"),
    notes: getString(formData, "notes"),
    pinCode: getString(formData, "pinCode"),
  };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateReservation(values: Record<string, string>): ReservationFormErrors {
  const errors: ReservationFormErrors = {};

  if (!values.guestName) {
    errors.guestName = "宿泊者名を入力してください。";
  }

  if (!values.guestEmail) {
    errors.guestEmail = "メールアドレスを入力してください。";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guestEmail)) {
    errors.guestEmail = "メールアドレスの形式で入力してください。";
  }

  if (!values.checkinDate) {
    errors.checkinDate = "チェックイン日を入力してください。";
  }

  if (!values.checkoutDate) {
    errors.checkoutDate = "チェックアウト日を入力してください。";
  }

  if (values.checkinDate && values.checkoutDate && values.checkoutDate <= values.checkinDate) {
    errors.checkoutDate = "チェックアウト日はチェックイン日より後の日付にしてください。";
  }

  if (!values.guestCount) {
    errors.guestCount = "人数を入力してください。";
  } else if (!Number.isInteger(Number(values.guestCount)) || Number(values.guestCount) < 1) {
    errors.guestCount = "人数は1以上の整数で入力してください。";
  }

  if (!values.propertyName) {
    errors.propertyName = "施設名を入力してください。";
  }

  if (!values.pinCode) {
    errors.pinCode = "暗証番号を入力してください。";
  } else if (!/^\d{4,8}$/.test(values.pinCode)) {
    errors.pinCode = "暗証番号は4〜8桁の数字で入力してください。";
  }

  return errors;
}

function createReservationCode() {
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `YM-${random}`;
}
