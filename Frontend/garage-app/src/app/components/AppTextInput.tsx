import { TextField, type TextFieldProps } from "@mui/material";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";

type Props<T extends FieldValues> = UseControllerProps<T> & {
  label: string;
  multiline?: boolean;
  rows?: number;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  helperText?: string;
  slotProps?: TextFieldProps["slotProps"];
};

export default function AppTextInput<T extends FieldValues>({
  label,
  multiline,
  rows,
  type,
  autoComplete,
  disabled,
  helperText,
  slotProps,
  ...controllerProps
}: Props<T>) {
  const { fieldState, field } = useController({
    ...controllerProps,
    defaultValue: (controllerProps.defaultValue ?? "") as never,
  });

  return (
    <TextField
      {...field}
      label={label}
      multiline={multiline}
      rows={rows}
      type={type}
      autoComplete={autoComplete}
      disabled={disabled}
      fullWidth
      variant="outlined"
      margin="normal"
      error={!!fieldState.error}
      helperText={fieldState.error?.message ?? helperText}
      slotProps={slotProps}
    />
  );
}
