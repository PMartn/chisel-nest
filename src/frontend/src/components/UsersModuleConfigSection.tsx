import { Box, Typography } from "@mui/material";
import { FormCard, StyledCheckbox, StyledSelect } from "./FormControls";

interface UsersModuleConfigSectionProps {
  includePostgres: boolean;
  includeMongo: boolean;
  includeUsersModule: boolean;
  setIncludeUsersModule: (val: boolean) => void;
  usersModuleLocation: "postgres" | "mongo";
  setUsersModuleLocation: (val: "postgres" | "mongo") => void;
}

export const UsersModuleConfigSection = ({
  includePostgres,
  includeMongo,
  includeUsersModule,
  setIncludeUsersModule,
  usersModuleLocation,
  setUsersModuleLocation,
}: UsersModuleConfigSectionProps) => {
  const anyEnabled = includePostgres || includeMongo;
  const bothEnabled = includePostgres && includeMongo;
  const singleTarget = includePostgres ? "PostgreSQL" : "MongoDB";

  return (
    <FormCard title="Users Module">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <StyledCheckbox
          label="Include a Users module"
          checked={anyEnabled && includeUsersModule}
          onChange={setIncludeUsersModule}
          disabled={!anyEnabled}
        />

        {!anyEnabled && (
          <Typography variant="caption" sx={{ color: "#64748b", ml: 3.5 }}>
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
              borderLeft: "2px solid #334155",
              pl: 2,
            }}
          >
            {bothEnabled ? (
              <StyledSelect
                label="Store users in"
                value={usersModuleLocation}
                onChange={(val) =>
                  setUsersModuleLocation(val as "postgres" | "mongo")
                }
                options={[
                  { value: "postgres", label: "PostgreSQL" },
                  { value: "mongo", label: "MongoDB" },
                ]}
              />
            ) : (
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                Users will be stored in {singleTarget}.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </FormCard>
  );
};
