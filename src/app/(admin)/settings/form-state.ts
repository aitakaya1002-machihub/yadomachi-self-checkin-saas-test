export type SettingsFormState = {
  ok: boolean;
  message: string;
  errors: Partial<
    Record<
      | "propertyName"
      | "address"
      | "emergencyContact"
      | "senderName"
      | "emailSubjectTemplate"
      | "emailBodyTemplate"
      | "cautionText",
      string
    >
  >;
  values: Record<string, string>;
};

export const initialSettingsFormState: SettingsFormState = {
  ok: false,
  message: "",
  errors: {},
  values: {},
};
