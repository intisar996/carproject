
import { Box, Tab, Tabs } from "@mui/material";

export interface StatusTabOption {
  value: string;
  label: string;
  count?: number;
}

interface StatusTabsProps {
  value: string;
  options: StatusTabOption[];
  onChange: (value: string) => void;
  variant?: "standard" | "scrollable" | "fullWidth";
}

export default function StatusTabs({
  value,
  options,
  onChange,
  variant = "scrollable",
}: StatusTabsProps) {
  return (
    <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
      <Tabs
        value={value}
        onChange={(_, newValue: string) => onChange(newValue)}
        variant={variant}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            value={option.value}
            label={
              option.count !== undefined
                ? `${option.label} (${option.count})`
                : option.label
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
