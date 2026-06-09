import type { ReactNode } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = InputProps & {
  label: string;
  helperText?: string;
  error?: string;
  action?: ReactNode;
};

export function FormField({
  id,
  label,
  helperText,
  error,
  action,
  className,
  ...inputProps
}: FormFieldProps) {
  const fieldId = id ?? inputProps.name;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={fieldId}>{label}</Label>
        {action}
      </div>
      <Input
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
        {...inputProps}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${fieldId}-helper`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
