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
  Divider,
} from "@mui/material";
import DirectoryBrowserModal from "./components/DirectoryBrowserModal";

export default function App() {
  const [projectName, setProjectName] = useState("my-nest-app");
  const [destinationPath, setDestinationPath] = useState("");
  const [includePostgres, setIncludePostgres] = useState(false);
  const [postgresOrm, setPostgresOrm] = useState("TypeORM");
  const [includeMongo, setIncludeMongo] = useState(false);
  const [mongoOrm, setMongoOrm] = useState("Mongoose");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Keep compatibility with the current backend pruning logic:
    // If PostgreSQL with TypeORM is selected, we pass "PostgreSQL (TypeORM)".
    // Otherwise, we pass "None".
    const backendDbValue = (includePostgres && postgresOrm === "TypeORM") ? "PostgreSQL (TypeORM)" : "None";

    const payload = {
      projectName,
      database: backendDbValue,
      destinationPath: destinationPath.trim(),
      postgresEnabled: includePostgres,
      postgresOrm,
      mongoEnabled: includeMongo,
      mongoOrm,
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

          <Box
            sx={{
              border: "1px solid #334155",
              borderRadius: 2,
              p: 2.5,
              bgcolor: "#0f172a",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "#818cf8", fontWeight: "bold" }}
            >
              Database Integration
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includePostgres}
                    onChange={(e) => setIncludePostgres(e.target.checked)}
                    sx={{ color: "#818cf8", "&.Mui-checked": { color: "#818cf8" } }}
                  />
                }
                label="Include PostgreSQL Database"
                sx={{ color: "#e2e8f0", m: 0 }}
              />

              {includePostgres && (
                <Box
                  sx={{
                    ml: 3.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderLeft: "2px solid #334155",
                    pl: 2,
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel id="postgres-orm-label" sx={{ color: "#94a3b8" }}>
                      ORM / Query Builder
                    </InputLabel>
                    <Select
                      labelId="postgres-orm-label"
                      value={postgresOrm}
                      label="ORM / Query Builder"
                      onChange={(e) => setPostgresOrm(e.target.value)}
                      sx={{
                        color: "#fff",
                        backgroundColor: "#1e293b",
                        "& .MuiSvgIcon-root": { color: "#fff" },
                      }}
                    >
                      <MenuItem value="TypeORM">TypeORM</MenuItem>
                      <MenuItem value="Prisma">Prisma</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "#334155" }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeMongo}
                    onChange={(e) => setIncludeMongo(e.target.checked)}
                    sx={{ color: "#818cf8", "&.Mui-checked": { color: "#818cf8" } }}
                  />
                }
                label="Include MongoDB Database"
                sx={{ color: "#e2e8f0", m: 0 }}
              />

              {includeMongo && (
                <Box
                  sx={{
                    ml: 3.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderLeft: "2px solid #334155",
                    pl: 2,
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel id="mongo-orm-label" sx={{ color: "#94a3b8" }}>
                      Database Adapter
                    </InputLabel>
                    <Select
                      labelId="mongo-orm-label"
                      value={mongoOrm}
                      label="Database Adapter"
                      onChange={(e) => setMongoOrm(e.target.value)}
                      sx={{
                        color: "#fff",
                        backgroundColor: "#1e293b",
                        "& .MuiSvgIcon-root": { color: "#fff" },
                      }}
                    >
                      <MenuItem value="Mongoose">Mongoose</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>
          </Box>

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
