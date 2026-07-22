import { Box, Divider } from "@mui/material";
import { FormCard, StyledCheckbox, StyledSelect } from "./FormControls";

interface DatabaseConfigSectionProps {
  includePostgres: boolean;
  setIncludePostgres: (val: boolean) => void;
  postgresOrm: string;
  setPostgresOrm: (val: string) => void;
  includeMongo: boolean;
  setIncludeMongo: (val: boolean) => void;
  mongoOrm: string;
  setMongoOrm: (val: string) => void;
}

export const DatabaseConfigSection = ({
  includePostgres,
  setIncludePostgres,
  postgresOrm,
  setPostgresOrm,
  includeMongo,
  setIncludeMongo,
  mongoOrm,
  setMongoOrm,
}: DatabaseConfigSectionProps) => (
  <FormCard title="Database Integration">
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <StyledCheckbox
        label="Include PostgreSQL Database"
        checked={includePostgres}
        onChange={setIncludePostgres}
      />

      {includePostgres && (
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
            value={postgresOrm}
            onChange={setPostgresOrm}
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
        checked={includeMongo}
        onChange={setIncludeMongo}
      />

      {includeMongo && (
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
            value={mongoOrm}
            onChange={setMongoOrm}
            options={[{ value: "Mongoose", label: "Mongoose" }]}
          />
        </Box>
      )}
    </Box>
  </FormCard>
);
