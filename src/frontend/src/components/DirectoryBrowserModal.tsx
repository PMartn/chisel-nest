import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";
import {
  FolderIcon,
  HomeIcon,
  DriveIcon,
  ArrowUpIcon,
  ProjectIcon,
} from "./icons";

interface DirectoryBrowserProps {
  open: boolean;
  onClose: () => void;
  initialPath: string;
  onSelect: (path: string) => void;
}

export default function DirectoryBrowserModal({
  open,
  onClose,
  initialPath,
  onSelect,
}: DirectoryBrowserProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [directories, setDirectories] = useState<string[]>([]);
  const [drives, setDrives] = useState<string[]>([]);
  const [homeDir, setHomeDir] = useState("");
  const [projectDir, setProjectDir] = useState("");
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDirectory = async (targetPath: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/browse?path=${encodeURIComponent(targetPath)}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to read directory");
      }
      const data = await res.json();
      setCurrentPath(data.currentPath);
      setPathInput(data.currentPath);
      setParentPath(data.parentPath);
      setDirectories(data.subdirectories);
      setDrives(data.drives || []);
      setHomeDir(data.homeDir);
      setProjectDir(data.projectDir);
    } catch (err: any) {
      setError(err.message || "Failed to read folder contents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDirectory(initialPath);
      setSearchQuery("");
    }
  }, [open, initialPath]);

  const handleNavigate = (subDirName: string) => {
    const separator =
      currentPath.endsWith("\\") || currentPath.endsWith("/")
        ? ""
        : currentPath.includes("\\")
          ? "\\"
          : "/";
    fetchDirectory(`${currentPath}${separator}${subDirName}`);
  };

  const handleNavigateUp = () => {
    if (parentPath) {
      fetchDirectory(parentPath);
    }
  };

  const handleJumpToPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathInput.trim()) {
      fetchDirectory(pathInput.trim());
    }
  };

  const handleSelectCurrent = () => {
    onSelect(currentPath);
    onClose();
  };

  const filteredDirectories = directories.filter((dir) =>
    dir.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#0f172a",
          color: "#fff",
          borderRadius: "16px",
          border: "1px solid #334155",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: "1px solid #1e293b", pb: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", color: "#818cf8" }}
        >
          📂 Select Destination Directory
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {homeDir && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchDirectory(homeDir)}
              sx={{
                color: "#a78bfa",
                borderColor: "#4c1d95",
                "&:hover": { borderColor: "#c084fc", background: "#2e1065" },
              }}
            >
              <HomeIcon /> Home Folder
            </Button>
          )}
          {projectDir && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchDirectory(projectDir)}
              sx={{
                color: "#34d399",
                borderColor: "#064e3b",
                "&:hover": { borderColor: "#6ee7b7", background: "#022c22" },
              }}
            >
              <ProjectIcon /> Workspace
            </Button>
          )}
          {drives.map((drive) => (
            <Button
              key={drive}
              size="small"
              variant="outlined"
              onClick={() => fetchDirectory(drive)}
              sx={{
                color: "#60a5fa",
                borderColor: "#1e3a8a",
                "&:hover": { borderColor: "#93c5fd", background: "#172554" },
              }}
            >
              <DriveIcon /> {drive}
            </Button>
          ))}
        </Box>

        <Box
          component="form"
          onSubmit={handleJumpToPath}
          sx={{ display: "flex", gap: 1 }}
        >
          <TextField
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            fullWidth
            size="small"
            placeholder="Enter directory path..."
            variant="outlined"
            slotProps={{
              htmlInput: {
                style: {
                  color: "#fff",
                  backgroundColor: "#1e293b",
                  fontFamily: "monospace",
                },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: "#4f46e5", "&:hover": { bgcolor: "#4338ca" } }}
          >
            Go
          </Button>
        </Box>

        {error && (
          <Typography sx={{ color: "#ef4444", fontSize: "0.875rem", pl: 1 }}>
            ⚠️ {error}
          </Typography>
        )}

        <TextField
          label="Search folders..."
          variant="standard"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          slotProps={{
            inputLabel: { style: { color: "#94a3b8" } },
            htmlInput: { style: { color: "#fff" } },
          }}
        />

        <Paper
          variant="outlined"
          sx={{
            bgcolor: "#0b0f19",
            borderColor: "#1e293b",
            borderRadius: 2,
            maxHeight: "320px",
            minHeight: "150px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
                height: "150px",
              }}
            >
              <CircularProgress size={30} sx={{ color: "#818cf8" }} />
            </Box>
          ) : (
            <List disablePadding>
              {parentPath && (
                <ListItem
                  disablePadding
                  divider
                  sx={{ borderColor: "#1e293b" }}
                >
                  <ListItemButton
                    onClick={handleNavigateUp}
                    sx={{ color: "#94a3b8", py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ArrowUpIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={<span style={{ fontWeight: "bold" }}>..</span>}
                    />
                  </ListItemButton>
                </ListItem>
              )}

              {filteredDirectories.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center", color: "#64748b" }}>
                  No directories found here.
                </Box>
              ) : (
                filteredDirectories.map((dir) => (
                  <ListItem
                    key={dir}
                    disablePadding
                    divider
                    sx={{ borderColor: "#1e293b" }}
                  >
                    <ListItemButton
                      onClick={() => handleNavigate(dir)}
                      sx={{ color: "#e2e8f0", py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FolderIcon />
                      </ListItemIcon>
                      <ListItemText primary={dir} />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Paper>
      </DialogContent>

      <Divider sx={{ borderColor: "#1e293b" }} />

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#0b0f19",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Typography
          sx={{
            color: "#64748b",
            mr: "auto",
            fontSize: "0.85rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%",
          }}
        >
          Selected:{" "}
          <span style={{ color: "#38bdf8", fontFamily: "monospace" }}>
            {currentPath}
          </span>
        </Typography>
        <Button
          onClick={onClose}
          sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelectCurrent}
          variant="contained"
          disabled={loading || !currentPath}
          sx={{
            bgcolor: "#818cf8",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#6366f1" },
            "&:disabled": { bgcolor: "#1e293b", color: "#64748b" },
          }}
        >
          Select Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
}
