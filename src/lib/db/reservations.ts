import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type ReservationRow = Tables<"reservations">;
export type ReservationInsert = TablesInsert<"reservations">;
export type ReservationUpdate = TablesUpdate<"reservations">;
export type MailLogRow = Tables<"mail_logs">;
export type MailLogInsert = TablesInsert<"mail_logs">;

export type ReservationDetail = ReservationRow & {
  mail_logs: MailLogRow[];
};

export type ReservationSortKey =
  | "checkin_date"
  | "checkout_date"
  | "guest_name"
  | "guest_count"
  | "property_name"
  | "status";

export type SortDirection = "asc" | "desc";

export type ReservationListItem = ReservationRow & {
  latest_mail_log: Pick<MailLogRow, "send_status" | "sent_at" | "created_at"> | null;
};

type ListReservationsParams = {
  query?: string;
  sort?: ReservationSortKey;
  direction?: SortDirection;
};

const reservationSortColumns: Record<ReservationSortKey, keyof ReservationRow> = {
  checkin_date: "checkin_date",
  checkout_date: "checkout_date",
  guest_name: "guest_name",
  guest_count: "guest_count",
  property_name: "property_name",
  status: "status",
};

export async function listReservations({
  query,
  sort = "checkin_date",
  direction = "asc",
}: ListReservationsParams = {}): Promise<ReservationListItem[]> {
  const supabase = await createServerSupabaseClient();

  let reservationsQuery = supabase
    .from("reservations")
    .select("*")
    .order(reservationSortColumns[sort], { ascending: direction === "asc" });

  const normalizedQuery = query?.trim();

  if (normalizedQuery) {
    const escapedQuery = normalizedQuery.replaceAll("%", "\\%").replaceAll("_", "\\_");

    reservationsQuery = reservationsQuery.or(
      [
        `guest_name.ilike.%${escapedQuery}%`,
        `guest_email.ilike.%${escapedQuery}%`,
        `property_name.ilike.%${escapedQuery}%`,
        `reservation_code.ilike.%${escapedQuery}%`,
      ].join(","),
    );
  }

  const { data: reservations, error } = await reservationsQuery;

  if (error) {
    throw new Error(error.message);
  }

  if (reservations.length === 0) {
    return [];
  }

  const reservationIds = reservations.map((reservation) => reservation.id);

  const { data: mailLogs, error: mailLogsError } = await supabase
    .from("mail_logs")
    .select("reservation_id, send_status, sent_at, created_at")
    .in("reservation_id", reservationIds)
    .order("created_at", { ascending: false });

  if (mailLogsError) {
    throw new Error(mailLogsError.message);
  }

  const latestMailLogs = new Map<
    string,
    Pick<MailLogRow, "send_status" | "sent_at" | "created_at">
  >();

  for (const mailLog of mailLogs) {
    if (!latestMailLogs.has(mailLog.reservation_id)) {
      latestMailLogs.set(mailLog.reservation_id, {
        send_status: mailLog.send_status,
        sent_at: mailLog.sent_at,
        created_at: mailLog.created_at,
      });
    }
  }

  return reservations.map((reservation) => ({
    ...reservation,
    latest_mail_log: latestMailLogs.get(reservation.id) ?? null,
  }));
}

export async function getReservationById(id: string): Promise<ReservationRow> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getReservationDetailById(id: string): Promise<ReservationDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!reservation) {
    return null;
  }

  const { data: mailLogs, error: mailLogsError } = await supabase
    .from("mail_logs")
    .select("*")
    .eq("reservation_id", id)
    .order("created_at", { ascending: false });

  if (mailLogsError) {
    throw new Error(mailLogsError.message);
  }

  return {
    ...reservation,
    mail_logs: mailLogs ?? [],
  };
}

export async function getReservationByGuestToken(guestToken: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("guest_access_token", guestToken)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createReservation(reservation: ReservationInsert) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateReservation(id: string, reservation: ReservationUpdate) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("reservations")
    .update(reservation)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createMailLog(mailLog: MailLogInsert) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("mail_logs")
    .insert(mailLog)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
