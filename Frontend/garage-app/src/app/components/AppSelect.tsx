import { MenuItem, TextField } from "@mui/material";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
}

type Props<T extends FieldValues> = UseControllerProps<T> & {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
};

export default function AppSelect<T extends FieldValues>({
  label,
  options,
  disabled,
  ...controllerProps
}: Props<T>) {
  const { fieldState, field } = useController({
    ...controllerProps,
    defaultValue: (controllerProps.defaultValue ?? "") as never,
  });

  return (
    <TextField
      {...field}
      select
      label={label}
      disabled={disabled}
      fullWidth
      margin="normal"
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
