import { Box, Typography } from "@mui/material";
import { FormCard, StyledCheckbox, StyledSelect } from "./FormControls";
import type { FormState, UpdateForm } from "../formState";

interface UsersModuleConfigSectionProps {
  config: FormState;
  update: UpdateForm;
}

export const UsersModuleConfigSection = ({
  config,
  update,
}: UsersModuleConfigSectionProps) => {
  const { includePostgres, includeMongo, includeUsersModule, usersModuleLocation } =
    config;
  const anyEnabled = includePostgres || includeMongo;
  const bothEnabled = includePostgres && includeMongo;
  const singleTarget = includePostgres ? "PostgreSQL" : "MongoDB";

  return (
    <FormCard title="Users Module">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <StyledCheckbox
          label="Include a Users module"
          checked={anyEnabled && includeUsersModule}
          onChange={(val) => update({ includeUsersModule: val })}
          disabled={!anyEnabled}
        />

        {!anyEnabled && (
          <Typography variant="caption" sx={{ color: "text.disabled", ml: 3.5 }}>
            Select at least one database to include a Users module.
          </Typography>
        )}

        {anyEnabled && includeUsersModule && (
          <Box
            sx={{
              ml: 3.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderLeft: "2px solid",
              borderColor: "divider",
              pl: 2,
            }}
          >
            {bothEnabled ? (
              <StyledSelect
                label="Store users in"
                value={usersModuleLocation}
                onChange={(val) =>
                  update({ usersModuleLocation: val as "postgres" | "mongo" })
                }
                options={[
                  { value: "postgres", label: "PostgreSQL" },
                  { value: "mongo", label: "MongoDB" },
                ]}
              />
            ) : (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Users will be stored in {singleTarget}.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </FormCard>
  );
};
