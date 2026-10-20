import { Box, Button, FormHelperText, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useController, type FieldValues, type UseControllerProps } from "react-hook-form";

type Props<T extends FieldValues> = UseControllerProps<T> & {
  label: string;
  buttonLabel: string;
  accept?: string;
};

export default function AppFileInput<T extends FieldValues>({
  label,
  buttonLabel,
  accept,
  ...controllerProps
}: Props<T>) {
  const { field, fieldState } = useController({
    ...controllerProps,
    defaultValue: (controllerProps.defaultValue ?? null) as never,
  });
  const file = field.value as File | null;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px dashed",
        borderColor: fieldState.error ? "error.main" : "grey.500",
        borderRadius: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
          {buttonLabel}
          <input
            hidden
            type="file"
            accept={accept}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
          />
        </Button>
        <Typography variant="body2" noWrap sx={{ maxWidth: "100%" }}>
          {file?.name}
        </Typography>
      </Box>
      {fieldState.error && (
        <FormHelperText error>{fieldState.error.message}</FormHelperText>
      )}
    </Box>
  );
}
