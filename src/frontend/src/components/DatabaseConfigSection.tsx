import { Box, Divider } from "@mui/material";
import { FormCard, StyledCheckbox, StyledSelect } from "./FormControls";
import type { FormState, UpdateForm } from "../formState";

interface DatabaseConfigSectionProps {
  config: FormState;
  update: UpdateForm;
}

export const DatabaseConfigSection = ({
  config,
  update,
}: DatabaseConfigSectionProps) => (
  <FormCard title="Database Integration">
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <StyledCheckbox
        label="Include PostgreSQL Database"
        checked={config.includePostgres}
        onChange={(val) => update({ includePostgres: val })}
      />

      {config.includePostgres && (
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
          <StyledSelect
            label="ORM / Query Builder"
            value={config.postgresOrm}
            onChange={(val) => update({ postgresOrm: val })}
            options={[
              { value: "TypeORM", label: "TypeORM" },
              { value: "Prisma", label: "Prisma" },
            ]}
          />
        </Box>
      )}
    </Box>

    <Divider />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <StyledCheckbox
        label="Include MongoDB Database"
        checked={config.includeMongo}
        onChange={(val) => update({ includeMongo: val })}
      />

      {config.includeMongo && (
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
          <StyledSelect
            label="Database Adapter"
            value={config.mongoOrm}
            onChange={(val) => update({ mongoOrm: val })}
            options={[{ value: "Mongoose", label: "Mongoose" }]}
          />
        </Box>
      )}
    </Box>
  </FormCard>
);
