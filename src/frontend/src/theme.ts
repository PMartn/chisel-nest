import { createTheme } from "@mui/material/styles";

// Core accent reused by both the palette and component overrides.
const accent = "#818cf8";
const accentDark = "#4f46e5";
const checkboxDisabled = "#475569";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: accent, dark: accentDark },
    secondary: { main: "#a78bfa" },
    background: { default: "#0f172a", paper: "#1e293b" },
    text: { primary: "#ffffff", secondary: "#94a3b8", disabled: "#64748b" },
    divider: "#334155",
    error: { main: "#ef4444" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: accent,
          "&.Mui-checked": { color: accent },
          "&.Mui-disabled": { color: checkboxDisabled },
        },
      },
    },
  },
});

// App-specific colors that don't map onto standard MUI palette slots:
// an extra "sunken" surface, decorative icon hues, the quick-access button
// palettes, and the two brand gradients. Centralized here so the whole app
// pulls its color decisions from a single file.
export const tokens = {
  surfaceSunken: "#0b0f19",
  icon: {
    folder: "#f59e0b",
    home: "#a78bfa",
    drive: "#60a5fa",
    up: "#94a3b8",
    project: "#34d399",
  },
  nav: {
    home: {
      color: "#a78bfa",
      border: "#4c1d95",
      hoverBorder: "#c084fc",
      hoverBg: "#2e1065",
    },
    workspace: {
      color: "#34d399",
      border: "#064e3b",
      hoverBorder: "#6ee7b7",
      hoverBg: "#022c22",
    },
    drive: {
      color: "#60a5fa",
      border: "#1e3a8a",
      hoverBorder: "#93c5fd",
      hoverBg: "#172554",
    },
  },
  gradients: {
    title: "linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)",
    submit: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    submitHover: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
  },
} as const;
