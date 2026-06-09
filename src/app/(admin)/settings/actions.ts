"use server";

import { revalidatePath } from "next/cache";
import { saveSettings } from "@/lib/db/settings";
import {
  defaultEmailBodyTemplate,
  defaultEmailSubjectTemplate,
} from "@/lib/mail/template";
import type { SettingsFormState } from "./form-state";

export async function saveSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const id = getString(formData, "id");
  const propertyName = getString(formData, "propertyName");
  const address = getString(formData, "address");
  const emergencyContact = getString(formData, "emergencyContact");
  const senderName = getString(formData, "senderName");
  const emailSubjectTemplate =
    getString(formData, "emailSubjectTemplate");
  const emailBodyTemplate =
    getString(formData, "emailBodyTemplate");
  const cautionText = getString(formData, "cautionText");
  const values = {
    propertyName,
    address,
    emergencyContact,
    senderName,
    emailSubjectTemplate,
    emailBodyTemplate,
    cautionText,
  };
  const errors: SettingsFormState["errors"] = {};

  if (!propertyName) {
    errors.propertyName = "施設名を入力してください。";
  }

  if (!address) {
    errors.address = "住所を入力してください。";
  }

  if (!emergencyContact) {
    errors.emergencyContact = "緊急連絡先を入力してください。";
  }

  if (!senderName) {
    errors.senderName = "メール送信者名を入力してください。";
  }

  if (!emailSubjectTemplate) {
    errors.emailSubjectTemplate = "メール件名テンプレートを入力してください。";
  }

  if (!emailBodyTemplate) {
    errors.emailBodyTemplate = "メール本文テンプレートを入力してください。";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "入力内容を確認してください。",
      errors,
      values,
    };
  }

  try {
    await saveSettings({
      ...(id ? { id } : {}),
      property_name: propertyName,
      address,
      emergency_contact: emergencyContact,
      sender_name: senderName,
      email_subject_template: emailSubjectTemplate || defaultEmailSubjectTemplate,
      email_body_template: emailBodyTemplate || defaultEmailBodyTemplate,
      checkin_guide_text: "",
      caution_text: cautionText,
      checkout_guide_text: "",
    });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `設定を保存できませんでした。${error.message}`
          : "設定を保存できませんでした。",
      errors: {},
      values,
    };
  }

  revalidatePath("/settings");
  return {
    ok: true,
    message: "設定を保存しました。",
    errors: {},
    values: {},
  };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
