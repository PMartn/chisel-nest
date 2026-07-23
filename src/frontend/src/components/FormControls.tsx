import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material";

// Reusable card container for grouping options
interface FormCardProps {
  title: string;
  children: React.ReactNode;
  gap?: number | string;
}

export const FormCard = ({ title, children, gap = 2.5 }: FormCardProps) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      p: 2.5,
      bgcolor: "background.default",
      display: "flex",
      flexDirection: "column",
      gap,
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{ color: "primary.main", fontWeight: "bold" }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

// Pre-styled dark text field
export const StyledTextField = (props: TextFieldProps) => (
  <TextField
    {...props}
    slotProps={{
      inputLabel: { style: { color: "#94a3b8" }, ...props.slotProps?.inputLabel },
      htmlInput: {
        style: { color: "#fff", backgroundColor: "#0f172a" },
        ...props.slotProps?.htmlInput,
      },
    }}
  />
);

// Pre-styled dark checkbox
interface StyledCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const StyledCheckbox = ({ label, checked, onChange, disabled = false }: StyledCheckboxProps) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
    }
    label={label}
    sx={{
      color: disabled ? "text.disabled" : "text.primary",
      m: 0,
      userSelect: "none",
    }}
  />
);

// Pre-styled Select Dropdown
interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
}

export const StyledSelect = ({ label, value, onChange, options, disabled = false }: StyledSelectProps) => {
  const labelId = `${label.toLowerCase().replace(/\s+/g, "-")}-label`;

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id={labelId} sx={{ color: "text.secondary" }}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as string)}
        sx={{
          color: disabled ? "text.disabled" : "text.primary",
          backgroundColor: "background.paper",
          "& .MuiSvgIcon-root": {
            color: disabled ? "text.disabled" : "text.primary",
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
