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
import { MiddlewareConfigSection } from "./components/MiddlewareConfigSection";
import { tokens } from "./theme";
import type { GeneratorAnswers } from "../../index";

export default function App() {
  const [projectName, setProjectName] = useState("my-nest-app");
  const [destinationPath, setDestinationPath] = useState("");
  const [includePostgres, setIncludePostgres] = useState(false);
  const [postgresOrm, setPostgresOrm] = useState("TypeORM");
  const [includeMongo, setIncludeMongo] = useState(false);
  const [mongoOrm, setMongoOrm] = useState("Mongoose");
  const [includeUsersModule, setIncludeUsersModule] = useState(true);
  const [usersModuleLocation, setUsersModuleLocation] = useState<
    "postgres" | "mongo"
  >("postgres");
  const [usePinoLogger, setUsePinoLogger] = useState(true);
  const [useHelmet, setUseHelmet] = useState(true);
  const [useRateLimiting, setUseRateLimiting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const anyDatabase = includePostgres || includeMongo;
    let usersModuleDatabase: "postgres" | "mongo" | "none";
    if (!anyDatabase || !includeUsersModule) {
      usersModuleDatabase = "none";
    } else if (includePostgres && includeMongo) {
      usersModuleDatabase = usersModuleLocation;
    } else {
      usersModuleDatabase = includePostgres ? "postgres" : "mongo";
    }

    const payload: GeneratorAnswers = {
      projectName,
      destinationPath: destinationPath.trim(),
      postgresEnabled: includePostgres,
      postgresOrm,
      mongoEnabled: includeMongo,
      mongoOrm,
      usersModuleDatabase,
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
            projectName={projectName}
            setProjectName={setProjectName}
            destinationPath={destinationPath}
            setDestinationPath={setDestinationPath}
            setPickerOpen={setPickerOpen}
          />

          <DirectoryBrowserModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            initialPath={destinationPath}
            onSelect={(selected) => setDestinationPath(selected)}
          />

          <DatabaseConfigSection
            includePostgres={includePostgres}
            setIncludePostgres={setIncludePostgres}
            postgresOrm={postgresOrm}
            setPostgresOrm={setPostgresOrm}
            includeMongo={includeMongo}
            setIncludeMongo={setIncludeMongo}
            mongoOrm={mongoOrm}
            setMongoOrm={setMongoOrm}
          />

          <UsersModuleConfigSection
            includePostgres={includePostgres}
            includeMongo={includeMongo}
            includeUsersModule={includeUsersModule}
            setIncludeUsersModule={setIncludeUsersModule}
            usersModuleLocation={usersModuleLocation}
            setUsersModuleLocation={setUsersModuleLocation}
          />

          <MiddlewareConfigSection
            usePinoLogger={usePinoLogger}
            setUsePinoLogger={setUsePinoLogger}
            useHelmet={useHelmet}
            setUseHelmet={setUseHelmet}
            useRateLimiting={useRateLimiting}
            setUseRateLimiting={setUseRateLimiting}
          />

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            size="large"
            sx={{
              background: tokens.gradients.submit,
              color: "#fff",
              "&:hover": {
                background: tokens.gradients.submitHover,
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
