import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
} from "@mui/material";
import DirectoryBrowserModal from "./components/DirectoryBrowserModal";
import { ProjectMetadataSection } from "./components/ProjectMetadataSection";
import { DatabaseConfigSection } from "./components/DatabaseConfigSection";
import { UsersModuleConfigSection } from "./components/UsersModuleConfigSection";
import { AuthConfigSection } from "./components/AuthConfigSection";
import { ModulesConfigSection } from "./components/ModulesConfigSection";
import { MiddlewareConfigSection } from "./components/MiddlewareConfigSection";
import { initialFormState, type FormState } from "./formState";
import { isFormValid } from "./validation";
import { tokens } from "./theme";
import type { GeneratorAnswers, CustomModule } from "../../shared/types";

export default function App() {
  const [config, setConfig] = useState<FormState>(initialFormState);
  const update = (patch: Partial<FormState>) =>
    setConfig((c) => ({ ...c, ...patch }));

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const formValid = isFormValid(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      projectName,
      destinationPath,
      includePostgres,
      postgresOrm,
      includeMongo,
      mongoOrm,
      includeUsersModule,
      usersModuleLocation,
      includeAuth,
      modules,
      usePinoLogger,
      useHelmet,
      useRateLimiting,
    } = config;

    const anyDatabase = includePostgres || includeMongo;
    let usersModuleDatabase: "postgres" | "mongo" | "none";
    if (!anyDatabase || !includeUsersModule) {
      usersModuleDatabase = "none";
    } else if (includePostgres && includeMongo) {
      usersModuleDatabase = usersModuleLocation;
    } else {
      usersModuleDatabase = includePostgres ? "postgres" : "mongo";
    }

    // Drop blank rows and pin each module to an enabled database. When only one
    // database is active, every module goes there regardless of its stored value.
    const effectiveModules: CustomModule[] = anyDatabase
      ? modules
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            database:
              includePostgres && includeMongo
                ? m.database
                : includePostgres
                  ? "postgres"
                  : "mongo",
          }))
      : [];

    const authProvider =
      usersModuleDatabase !== "none" && includeAuth ? "local" : "none";

    const payload: GeneratorAnswers = {
      projectName,
      destinationPath: destinationPath.trim(),
      postgresEnabled: includePostgres,
      postgresOrm,
      mongoEnabled: includeMongo,
      mongoOrm,
      usersModuleDatabase,
      authProvider,
      modules: effectiveModules,
      usePinoLogger,
      useHelmet,
      useRateLimiting,
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
    } catch {
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
        <Typography sx={{ color: "text.secondary" }}>
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
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 4,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            textAlign: "center",
            mb: 3,
            background: tokens.gradients.title,
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
          <ProjectMetadataSection
            config={config}
            update={update}
            setPickerOpen={setPickerOpen}
          />

          <DirectoryBrowserModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            initialPath={config.destinationPath}
            onSelect={(selected) => update({ destinationPath: selected })}
          />

          <DatabaseConfigSection config={config} update={update} />

          <UsersModuleConfigSection config={config} update={update} />

          <AuthConfigSection config={config} update={update} />

          <ModulesConfigSection config={config} update={update} />

          <MiddlewareConfigSection config={config} update={update} />

          <Button
            type="submit"
            disabled={loading || !formValid}
            variant="contained"
            size="large"
            sx={{
              background: tokens.gradients.submit,
              color: "#fff",
              "&:hover": {
                background: tokens.gradients.submitHover,
              },
              "&:disabled": {
                backgroundImage: "none",
                bgcolor: "background.default",
                color: "text.disabled",
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
