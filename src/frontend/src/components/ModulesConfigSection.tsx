import { Box, Button, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { FormCard, StyledTextField, StyledSelect } from "./FormControls";
import type { CustomModule } from "../../../index";

interface ModulesConfigSectionProps {
  includePostgres: boolean;
  includeMongo: boolean;
  modules: CustomModule[];
  setModules: (modules: CustomModule[]) => void;
}

export const ModulesConfigSection = ({
  includePostgres,
  includeMongo,
  modules,
  setModules,
}: ModulesConfigSectionProps) => {
  const anyEnabled = includePostgres || includeMongo;
  const bothEnabled = includePostgres && includeMongo;
  const singleTarget = includePostgres ? "PostgreSQL" : "MongoDB";
  const defaultDatabase: "postgres" | "mongo" = includePostgres
    ? "postgres"
    : "mongo";

  const addModule = () =>
    setModules([...modules, { name: "", database: defaultDatabase }]);

  const updateModule = (index: number, patch: Partial<CustomModule>) =>
    setModules(modules.map((m, i) => (i === index ? { ...m, ...patch } : m)));

  const removeModule = (index: number) =>
    setModules(modules.filter((_, i) => i !== index));

  return (
    <FormCard title="Feature Modules">
      {!anyEnabled ? (
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          Select at least one database to add feature modules.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {modules.length === 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              No modules yet. Add one to scaffold a hexagonal feature module.
            </Typography>
          )}

          {modules.map((module, index) => (
            <Box
              key={index}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <StyledTextField
                label="Module Name"
                variant="outlined"
                size="small"
                value={module.name}
                onChange={(e) => updateModule(index, { name: e.target.value })}
                fullWidth
                placeholder="e.g. Product"
              />

              {bothEnabled && (
                <Box sx={{ minWidth: 150 }}>
                  <StyledSelect
                    label="Database"
                    value={module.database}
                    onChange={(val) =>
                      updateModule(index, {
                        database: val as "postgres" | "mongo",
                      })
                    }
                    options={[
                      { value: "postgres", label: "PostgreSQL" },
                      { value: "mongo", label: "MongoDB" },
                    ]}
                  />
                </Box>
              )}

              <IconButton
                aria-label="Remove module"
                onClick={() => removeModule(index)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "error.main" },
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          ))}

          {!bothEnabled && modules.length > 0 && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Modules will be stored in {singleTarget}.
            </Typography>
          )}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addModule}
            sx={{
              alignSelf: "flex-start",
              color: "primary.main",
              borderColor: "primary.dark",
              "&:hover": { borderColor: "#c084fc", background: "#1e1b4b" },
            }}
          >
            Add Module
          </Button>
        </Box>
      )}
    </FormCard>
  );
};
