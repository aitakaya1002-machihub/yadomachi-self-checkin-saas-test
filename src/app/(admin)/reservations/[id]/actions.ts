"use server";

import { revalidatePath } from "next/cache";
import { updateReservation } from "@/lib/db/reservations";
import { sendCheckinGuideMail } from "@/lib/mail/send-checkin-guide";
import type { ReservationStatus } from "@/types/reservation";

type ActionResult = {
  ok: boolean;
  message: string;
};

const reservationStatuses = [
  "registered",
  "pin_set",
  "mail_sent",
  "ready_for_checkin",
  "checked_in",
  "checked_out",
] as const satisfies readonly ReservationStatus[];

export async function updateReservationInfoAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = getRequiredString(formData, "reservationId");
  const guestName = getString(formData, "guestName");
  const guestEmail = getString(formData, "guestEmail");
  const guestPhone = getString(formData, "guestPhone");
  const checkinDate = getString(formData, "checkinDate");
  const checkoutDate = getString(formData, "checkoutDate");
  const guestCount = getString(formData, "guestCount");
  const propertyName = getString(formData, "propertyName");

  if (!guestName || !guestEmail || !checkinDate || !checkoutDate || !guestCount || !propertyName) {
    return { ok: false, message: "必須項目を入力してください。" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
    return { ok: false, message: "メールアドレスの形式で入力してください。" };
  }

  if (checkoutDate <= checkinDate) {
    return { ok: false, message: "チェックアウト日はチェックイン日より後の日付にしてください。" };
  }

  if (!Number.isInteger(Number(guestCount)) || Number(guestCount) < 1) {
    return { ok: false, message: "人数は1以上の整数で入力してください。" };
  }

  await updateReservation(id, {
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone || null,
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
    guest_count: Number(guestCount),
    property_name: propertyName,
  });

  revalidateReservation(id);
  return { ok: true, message: "予約情報を更新しました。" };
}

export async function updatePinCodeAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = getRequiredString(formData, "reservationId");
  const pinCode = getString(formData, "pinCode");

  if (!/^\d{4,8}$/.test(pinCode)) {
    return { ok: false, message: "暗証番号は4〜8桁の数字で入力してください。" };
  }

  await updateReservation(id, {
    pin_code: pinCode,
    status: "pin_set",
  });

  revalidateReservation(id);
  return { ok: true, message: "暗証番号を更新し、ステータスを「暗証番号設定済み」にしました。" };
}

export async function updateStatusAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = getRequiredString(formData, "reservationId");
  const status = getString(formData, "status");

  if (!reservationStatuses.includes(status as ReservationStatus)) {
    return { ok: false, message: "ステータスを選択してください。" };
  }

  await updateReservation(id, {
    status: status as ReservationStatus,
  });

  revalidateReservation(id);
  return { ok: true, message: "ステータスを更新しました。" };
}

export async function updateNotesAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = getRequiredString(formData, "reservationId");
  const notes = getString(formData, "notes");

  await updateReservation(id, {
    notes: notes || null,
  });

  revalidateReservation(id);
  return { ok: true, message: "備考を更新しました。" };
}

export async function sendGuideMailAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const id = getRequiredString(formData, "reservationId");
  const result = await sendCheckinGuideMail(id);

  revalidateReservation(id);
  return result;
}

function getRequiredString(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateReservation(id: string) {
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${id}`);
}
