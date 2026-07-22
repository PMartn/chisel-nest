import { Box, Button, Typography } from "@mui/material";
import { StyledTextField } from "./FormControls";

interface ProjectMetadataSectionProps {
  projectName: string;
  setProjectName: (val: string) => void;
  destinationPath: string;
  setDestinationPath: (val: string) => void;
  setPickerOpen: (val: boolean) => void;
}

export const ProjectMetadataSection = ({
  projectName,
  setProjectName,
  destinationPath,
  setDestinationPath,
  setPickerOpen,
}: ProjectMetadataSectionProps) => (
  <>
    <StyledTextField
      label="Project Name"
      variant="outlined"
      value={projectName}
      onChange={(e) => setProjectName(e.target.value)}
      fullWidth
      required
    />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", gap: 1 }}>
        <StyledTextField
          label="Destination Path"
          variant="outlined"
          value={destinationPath}
          onChange={(e) => setDestinationPath(e.target.value)}
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
