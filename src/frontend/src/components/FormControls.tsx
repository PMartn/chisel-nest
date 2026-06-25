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
      border: "1px solid #334155",
      borderRadius: 2,
      p: 2.5,
      bgcolor: "#0f172a",
      display: "flex",
      flexDirection: "column",
      gap,
    }}
  >
    <Typography variant="subtitle1" sx={{ color: "#818cf8", fontWeight: "bold" }}>
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
        sx={{
          color: "#818cf8",
          "&.Mui-checked": { color: "#818cf8" },
          "&.Mui-disabled": { color: "#475569" },
        }}
      />
    }
    label={label}
    sx={{
      color: disabled ? "#64748b" : "#e2e8f0",
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
      <InputLabel id={labelId} sx={{ color: "#94a3b8" }}>
        {label}
      </InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as string)}
        sx={{
          color: disabled ? "#64748b" : "#fff",
          backgroundColor: "#1e293b",
          "& .MuiSvgIcon-root": { color: disabled ? "#475569" : "#fff" },
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
