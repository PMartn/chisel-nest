import { Box, Typography } from "@mui/material";
import { FormCard, StyledCheckbox } from "./FormControls";
import type { FormState, UpdateForm } from "../formState";

interface AuthConfigSectionProps {
  config: FormState;
  update: UpdateForm;
}

export const AuthConfigSection = ({
  config,
  update,
}: AuthConfigSectionProps) => {
  const { includePostgres, includeMongo, includeUsersModule, includeAuth } =
    config;
  const usersEnabled =
    (includePostgres || includeMongo) && includeUsersModule;

  return (
    <FormCard title="Authentication">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <StyledCheckbox
          label="Add authentication & roles (Local JWT)"
          checked={usersEnabled && includeAuth}
          onChange={(val) => update({ includeAuth: val })}
          disabled={!usersEnabled}
        />

        {!usersEnabled && (
          <Typography variant="caption" sx={{ color: "text.disabled", ml: 3.5 }}>
            Enable the Users module to add authentication.
          </Typography>
        )}

        {usersEnabled && includeAuth && (
          <Box
            sx={{
              ml: 3.5,
              borderLeft: "2px solid",
              borderColor: "divider",
              pl: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Email &amp; password auth with JWT, plus <code>user</code>/
              <code>admin</code> role guards. Endpoints are secured by default —
              only <code>/auth/login</code> and <code>/auth/register</code> stay
              public.
            </Typography>
          </Box>
        )}
      </Box>
    </FormCard>
  );
};
