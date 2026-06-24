import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Container,
} from "@mui/material";
import DirectoryBrowserModal from "./components/DirectoryBrowserModal";

export default function App() {
  const [projectName, setProjectName] = useState("my-nest-app");
  const [database, setDatabase] = useState("None");
  const [destinationPath, setDestinationPath] = useState("");
  const [useAuth, setUseAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const backendDbValue =
      database === "PostgreSQL" ? "PostgreSQL (TypeORM)" : "None";

    const payload = {
      projectName,
      database: backendDbValue,
      useAuth,
      destinationPath: destinationPath.trim(),
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Generation failed. Check backend logs.");
      }
    } catch (err) {
      alert("Generation failed. Check terminal log.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{ textAlign: "center", padding: "40px", color: "#4ade80", mt: 8 }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          🚀 Scaffold Complete!
        </Typography>
        <Typography sx={{ color: "#94a3b8" }}>
          Your project has been successfully set up. You can close this tab and
          return to the terminal.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 6,
          padding: 4,
          background: "#1e293b",
          color: "#fff",
          borderRadius: 4,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          border: "1px solid #334155",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "#818cf8",
            fontWeight: "bold",
            textAlign: "center",
            mb: 3,
            background: "linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NestJS Scaffolder
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
        >
          <TextField
            label="Project Name"
            variant="outlined"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            required
            slotProps={{
              inputLabel: { style: { color: "#94a3b8" } },
              htmlInput: {
                style: { color: "#fff", backgroundColor: "#0f172a" },
              },
            }}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Destination Path"
                variant="outlined"
                value={destinationPath}
                onChange={(e) => setDestinationPath(e.target.value)}
                fullWidth
                placeholder="Defaults to current folder"
                slotProps={{
                  inputLabel: { style: { color: "#94a3b8" } },
                  htmlInput: {
                    style: { color: "#fff", backgroundColor: "#0f172a" },
                  },
                }}
              />
              <Button
                variant="outlined"
                onClick={() => setPickerOpen(true)}
                sx={{
                  color: "#818cf8",
                  borderColor: "#4f46e5",
                  minWidth: "100px",
                  "&:hover": { borderColor: "#c084fc", background: "#1e1b4b" },
                }}
              >
                Browse...
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: "#94a3b8", pl: 1 }}>
              Leave blank to create project in the server's working directory.
            </Typography>
          </Box>

          <DirectoryBrowserModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            initialPath={destinationPath}
            onSelect={(selected) => setDestinationPath(selected)}
          />

          <FormControl fullWidth variant="outlined">
            <InputLabel id="database-label" sx={{ color: "#94a3b8" }}>
              Database
            </InputLabel>
            <Select
              labelId="database-label"
              value={database}
              label="Database"
              onChange={(e) => setDatabase(e.target.value)}
              sx={{
                color: "#fff",
                backgroundColor: "#0f172a",
                "& .MuiSvgIcon-root": { color: "#fff" },
              }}
            >
              <MenuItem value="None">None (SQLite/In-Memory Mock)</MenuItem>
              <MenuItem value="PostgreSQL">PostgreSQL (TypeORM)</MenuItem>
            </Select>
          </FormControl>

          {database !== "None" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={useAuth}
                  onChange={(e) => setUseAuth(e.target.checked)}
                  sx={{
                    color: "#818cf8",
                    "&.Mui-checked": { color: "#818cf8" },
                  }}
                />
              }
              label="Include Database Authentication Boilerplate"
              sx={{ color: "#e2e8f0" }}
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
              },
              padding: "12px",
              fontWeight: "bold",
              boxShadow: "0 4px 15px -3px rgba(99, 102, 241, 0.4)",
              mt: 1,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Project"
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
