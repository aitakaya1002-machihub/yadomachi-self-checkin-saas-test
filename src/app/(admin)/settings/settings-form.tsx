"use client";

import { useActionState, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import {
  defaultEmailBodyTemplate,
  defaultEmailSubjectTemplate,
  renderMailTemplate,
  type MailTemplateVariables,
} from "@/lib/mail/template";
import type { Settings } from "@/types/reservation";
import { initialSettingsFormState, saveSettingsAction } from "./actions";

const sampleVariables: MailTemplateVariables = {
  guest_name: "山田 太郎",
  property_name: "町家ステイ東山",
  checkin_date: "2026-07-12",
  checkout_date: "2026-07-14",
  pin_code: "1234",
  guest_page_url: "http://localhost:3000/guest/sample-token",
  emergency_contact: "090-0000-0000",
};

type SettingsFormProps = {
  settings: Settings | null;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSettingsAction,
    initialSettingsFormState,
  );
  const [subjectTemplate, setSubjectTemplate] = useState(
    settings?.email_subject_template ?? defaultEmailSubjectTemplate,
  );
  const [bodyTemplate, setBodyTemplate] = useState(
    settings?.email_body_template ?? defaultEmailBodyTemplate,
  );
  const formState = state ?? initialSettingsFormState;
  const errors = formState.errors ?? {};
  const values = formState.values ?? {};
  const getValue = (name: string, fallback: string) => values[name] ?? fallback;

  const preview = useMemo(
    () =>
      renderMailTemplate({
        subjectTemplate,
        bodyTemplate,
        variables: sampleVariables,
      }),
    [bodyTemplate, subjectTemplate],
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={settings?.id ?? ""} />
      {formState.message ? (
        <div
          className={
            formState.ok
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {formState.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="propertyName"
          label="施設名"
          defaultValue={getValue("propertyName", settings?.property_name ?? "")}
          placeholder="例: 町家ステイ東山"
          error={errors.propertyName}
          required
        />
        <FormField
          name="senderName"
          label="メール送信者名"
          defaultValue={getValue("senderName", settings?.sender_name ?? "")}
          placeholder="例: 町家ステイ東山"
          error={errors.senderName}
          required
        />
      </div>
      <FormField
        name="address"
        label="住所"
        defaultValue={getValue("address", settings?.address ?? "")}
        placeholder="例: 京都府京都市..."
        error={errors.address}
        required
      />
      <FormField
        name="emergencyContact"
        label="緊急連絡先"
        defaultValue={getValue("emergencyContact", settings?.emergency_contact ?? "")}
        placeholder="例: 090-0000-0000"
        error={errors.emergencyContact}
        required
      />

      <div className="grid gap-2">
        <label htmlFor="emailSubjectTemplate" className="text-sm font-medium leading-none">
          メール件名テンプレート
        </label>
        <input
          id="emailSubjectTemplate"
          name="emailSubjectTemplate"
          value={subjectTemplate}
          onChange={(event) => setSubjectTemplate(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={errors.emailSubjectTemplate ? "true" : undefined}
          required
        />
        {errors.emailSubjectTemplate ? (
          <p className="text-sm text-destructive">{errors.emailSubjectTemplate}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label htmlFor="emailBodyTemplate" className="text-sm font-medium leading-none">
          メール本文テンプレート
        </label>
        <textarea
          id="emailBodyTemplate"
          name="emailBodyTemplate"
          rows={12}
          value={bodyTemplate}
          onChange={(event) => setBodyTemplate(event.target.value)}
          className="min-h-64 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={errors.emailBodyTemplate ? "true" : undefined}
          required
        />
        {errors.emailBodyTemplate ? (
          <p className="text-sm text-destructive">{errors.emailBodyTemplate}</p>
        ) : null}
      </div>

      <TemplateTextarea
        name="cautionText"
        label="注意事項"
        defaultValue={getValue("cautionText", settings?.caution_text ?? "")}
      />

      <div className="rounded-lg border bg-slate-50 p-4">
        <div className="text-sm font-medium">使える差し込み変数</div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {Object.keys(sampleVariables).map((key) => (
            <code key={key} className="rounded bg-white px-2 py-1">
              {`{{${key}}}`}
            </code>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PreviewPanel title="テキストメールプレビュー">
          <div className="border-b pb-3 font-medium">{preview.subject}</div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6">
            {preview.text}
          </pre>
        </PreviewPanel>
        <PreviewPanel title="HTMLメールプレビュー">
          <div className="border-b pb-3 font-medium">{preview.subject}</div>
          <div
            className="prose prose-sm mt-3 max-w-none text-sm leading-6"
            dangerouslySetInnerHTML={{ __html: preview.html }}
          />
        </PreviewPanel>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "保存中" : "設定を保存"}
        </Button>
      </div>
    </form>
  );
}

function TemplateTextarea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium leading-none">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={5}
        defaultValue={defaultValue}
        className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function PreviewPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-3 rounded-md border bg-slate-50 p-4">{children}</div>
    </div>
  );
}
