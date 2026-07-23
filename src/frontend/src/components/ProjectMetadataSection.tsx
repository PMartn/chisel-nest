import { Box, Button, Typography } from "@mui/material";
import { StyledTextField } from "./FormControls";
import { projectNameError } from "../validation";
import type { FormState, UpdateForm } from "../formState";

interface ProjectMetadataSectionProps {
  config: FormState;
  update: UpdateForm;
  setPickerOpen: (val: boolean) => void;
}

export const ProjectMetadataSection = ({
  config,
  update,
  setPickerOpen,
}: ProjectMetadataSectionProps) => {
  const nameError = projectNameError(config.projectName);

  return (
  <>
    <StyledTextField
      label="Project Name"
      variant="outlined"
      value={config.projectName}
      onChange={(e) => update({ projectName: e.target.value })}
      fullWidth
      required
      error={Boolean(nameError)}
      helperText={nameError ?? undefined}
    />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <StyledTextField
          label="Destination Path"
          variant="outlined"
          value={config.destinationPath}
          onChange={(e) => update({ destinationPath: e.target.value })}
          fullWidth
          placeholder="Defaults to current folder"
        />
        <Button
          variant="outlined"
          onClick={() => setPickerOpen(true)}
          sx={{
            color: "primary.main",
            borderColor: "primary.dark",
            minWidth: "100px",
            "&:hover": { borderColor: "#c084fc", background: "#1e1b4b" },
          }}
        >
          Browse...
        </Button>
      </Box>
      <Typography variant="caption" sx={{ color: "text.secondary", pl: 1 }}>
        Leave blank to create project in the server's working directory.
      </Typography>
    </Box>
  </>
  );
};
