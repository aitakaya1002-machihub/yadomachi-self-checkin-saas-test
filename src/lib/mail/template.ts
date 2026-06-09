import type { Reservation, Settings } from "@/types/reservation";

export type MailTemplateVariables = {
  guest_name: string;
  property_name: string;
  checkin_date: string;
  checkout_date: string;
  pin_code: string;
  guest_page_url: string;
  emergency_contact: string;
};

export type RenderedMailTemplate = {
  subject: string;
  text: string;
  html: string;
};

export const defaultEmailSubjectTemplate =
  "【{{property_name}}】チェックインのご案内";

export const defaultEmailBodyTemplate = `{{guest_name}} 様

この度は {{property_name}} をご予約いただきありがとうございます。

チェックイン日: {{checkin_date}}
チェックアウト日: {{checkout_date}}
入室用暗証番号: {{pin_code}}
緊急連絡先: {{emergency_contact}}

以下のURLから入室情報をご確認ください。
{{guest_page_url}}`;

const templateKeys = [
  "guest_name",
  "property_name",
  "checkin_date",
  "checkout_date",
  "pin_code",
  "guest_page_url",
  "emergency_contact",
] as const satisfies readonly (keyof MailTemplateVariables)[];

export function renderTemplate(template: string, variables: MailTemplateVariables) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, key: string) => {
    if (isTemplateKey(key)) {
      return variables[key];
    }

    return match;
  });
}

export function renderMailTemplate({
  subjectTemplate,
  bodyTemplate,
  variables,
}: {
  subjectTemplate: string;
  bodyTemplate: string;
  variables: MailTemplateVariables;
}): RenderedMailTemplate {
  const subject = renderTemplate(subjectTemplate, variables);
  const text = renderTemplate(bodyTemplate, variables);

  return {
    subject,
    text,
    html: textToHtml(text),
  };
}

export function createReservationTemplateVariables({
  reservation,
  settings,
  guestPageUrl,
}: {
  reservation: Pick<
    Reservation,
    | "guest_name"
    | "property_name"
    | "checkin_date"
    | "checkout_date"
    | "pin_code"
    | "emergency_contact"
  >;
  settings?: Pick<Settings, "emergency_contact"> | null;
  guestPageUrl: string;
}): MailTemplateVariables {
  return {
    guest_name: reservation.guest_name,
    property_name: reservation.property_name,
    checkin_date: reservation.checkin_date,
    checkout_date: reservation.checkout_date,
    pin_code: reservation.pin_code ?? "未設定",
    guest_page_url: guestPageUrl,
    emergency_contact:
      reservation.emergency_contact || settings?.emergency_contact || "未設定",
  };
}

export function textToHtml(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function isTemplateKey(key: string): key is keyof MailTemplateVariables {
  return templateKeys.includes(key as keyof MailTemplateVariables);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
