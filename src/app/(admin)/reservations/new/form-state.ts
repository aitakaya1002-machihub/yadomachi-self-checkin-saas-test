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

export const initialFormState: ReservationFormState = {
  errors: {},
  values: {},
};
