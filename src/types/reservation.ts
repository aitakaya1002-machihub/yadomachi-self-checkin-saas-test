import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type ReservationStatus = Enums<"reservation_status">;
export type MailSendStatus = Enums<"mail_send_status">;

export type Reservation = Tables<"reservations">;
export type ReservationInsert = TablesInsert<"reservations">;
export type ReservationUpdate = TablesUpdate<"reservations">;

export type MailLog = Tables<"mail_logs">;
export type MailLogInsert = TablesInsert<"mail_logs">;
export type MailLogUpdate = TablesUpdate<"mail_logs">;

export type Settings = Tables<"settings">;
export type SettingsInsert = TablesInsert<"settings">;
export type SettingsUpdate = TablesUpdate<"settings">;

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  registered: "登録済み",
  pin_set: "暗証番号設定済み",
  mail_sent: "案内送信済み",
  ready_for_checkin: "チェックイン予定",
  checked_in: "滞在中",
  checked_out: "完了",
};

export const mailSendStatusLabels: Record<MailSendStatus, string> = {
  pending: "送信待ち",
  sent: "送信済み",
  failed: "送信失敗",
};

export function getReservationStatusLabel(status: ReservationStatus) {
  return reservationStatusLabels[status];
}

export function getMailSendStatusLabel(status: MailSendStatus) {
  return mailSendStatusLabels[status];
}
