import { Resend } from "resend";
import { getSettings } from "@/lib/db/settings";
import {
  createMailLog,
  getReservationById,
  updateReservation,
} from "@/lib/db/reservations";
import {
  createReservationTemplateVariables,
  defaultEmailBodyTemplate,
  defaultEmailSubjectTemplate,
  renderMailTemplate,
} from "@/lib/mail/template";

export type SendCheckinGuideResult = {
  ok: boolean;
  message: string;
};

export async function sendCheckinGuideMail(
  reservationId: string,
): Promise<SendCheckinGuideResult> {
  const reservation = await getReservationById(reservationId);
  const settings = await getSettings();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const guestPageUrl = `${appUrl}/guest/checkin/${reservation.guest_access_token}`;
  const renderedMail = renderMailTemplate({
    subjectTemplate: settings?.email_subject_template ?? defaultEmailSubjectTemplate,
    bodyTemplate: settings?.email_body_template ?? defaultEmailBodyTemplate,
    variables: createReservationTemplateVariables({
      reservation,
      settings,
      guestPageUrl,
    }),
  });

  if (!reservation.pin_code) {
    return {
      ok: false,
      message: "暗証番号を設定してから案内メールを送信してください。",
    };
  }

  if (reservation.status === "registered") {
    return {
      ok: false,
      message: "先に暗証番号を設定してください。",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CHECKIN_EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    await createMailLog({
      reservation_id: reservationId,
      subject: renderedMail.subject,
      body: renderedMail.text,
      send_status: "failed",
    });

    return {
      ok: false,
      message: "RESEND_API_KEY が未設定のため、メールを送信できませんでした。",
    };
  }

  try {
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from,
      to: reservation.guest_email,
      subject: renderedMail.subject,
      text: renderedMail.text,
      html: renderedMail.html,
    });

    await createMailLog({
      reservation_id: reservationId,
      subject: renderedMail.subject,
      body: renderedMail.text,
      sent_at: new Date().toISOString(),
      send_status: "sent",
    });

    await updateReservation(reservationId, {
      status: "mail_sent",
    });

    return {
      ok: true,
      message: "チェックイン案内メールを送信しました。",
    };
  } catch (error) {
    await createMailLog({
      reservation_id: reservationId,
      subject: renderedMail.subject,
      body: renderedMail.text,
      send_status: "failed",
    });

    return {
      ok: false,
      message:
        error instanceof Error
          ? `メール送信に失敗しました。${error.message}`
          : "メール送信に失敗しました。",
    };
  }
}
