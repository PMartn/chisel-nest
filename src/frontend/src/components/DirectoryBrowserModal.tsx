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
import FolderIcon from "@mui/icons-material/Folder";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CodeIcon from "@mui/icons-material/Code";
import { tokens } from "../theme";

interface DirectoryBrowserProps {
  open: boolean;
  onClose: () => void;
  initialPath: string;
  onSelect: (path: string) => void;
}

interface BrowseResponse {
  currentPath: string;
  parentPath: string | null;
  subdirectories: string[];
  drives?: string[];
  homeDir: string;
  projectDir: string;
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
        const data: { error?: string } = await res.json();
        throw new Error(data.error || "Failed to read directory");
      }
      const data: BrowseResponse = await res.json();
      setCurrentPath(data.currentPath);
      setPathInput(data.currentPath);
      setParentPath(data.parentPath);
      setDirectories(data.subdirectories);
      setDrives(data.drives || []);
      setHomeDir(data.homeDir);
      setProjectDir(data.projectDir);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to read folder contents.",
      );
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
          backgroundColor: "background.default",
          color: "text.primary",
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: "background.paper", pb: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", color: "primary.main" }}
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
              startIcon={<HomeIcon />}
              onClick={() => fetchDirectory(homeDir)}
              sx={{
                color: tokens.nav.home.color,
                borderColor: tokens.nav.home.border,
                "&:hover": {
                  borderColor: tokens.nav.home.hoverBorder,
                  background: tokens.nav.home.hoverBg,
                },
              }}
            >
              Home Folder
            </Button>
          )}
          {projectDir && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={() => fetchDirectory(projectDir)}
              sx={{
                color: tokens.nav.workspace.color,
                borderColor: tokens.nav.workspace.border,
                "&:hover": {
                  borderColor: tokens.nav.workspace.hoverBorder,
                  background: tokens.nav.workspace.hoverBg,
                },
              }}
            >
              Workspace
            </Button>
          )}
          {drives.map((drive) => (
            <Button
              key={drive}
              size="small"
              variant="outlined"
              startIcon={<StorageIcon />}
              onClick={() => fetchDirectory(drive)}
              sx={{
                color: tokens.nav.drive.color,
                borderColor: tokens.nav.drive.border,
                "&:hover": {
                  borderColor: tokens.nav.drive.hoverBorder,
                  background: tokens.nav.drive.hoverBg,
                },
              }}
            >
              {drive}
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
            sx={{ bgcolor: "primary.dark", "&:hover": { bgcolor: "#4338ca" } }}
          >
            Go
          </Button>
        </Box>

        {error && (
          <Typography sx={{ color: "error.main", fontSize: "0.875rem", pl: 1 }}>
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
            bgcolor: tokens.surfaceSunken,
            borderColor: "background.paper",
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
              <CircularProgress size={30} sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            <List disablePadding>
              {parentPath && (
                <ListItem
                  disablePadding
                  divider
                  sx={{ borderColor: "background.paper" }}
                >
                  <ListItemButton
                    onClick={handleNavigateUp}
                    sx={{ color: "text.secondary", py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ArrowUpwardIcon sx={{ color: tokens.icon.up, fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<span style={{ fontWeight: "bold" }}>..</span>}
                    />
                  </ListItemButton>
                </ListItem>
              )}

              {filteredDirectories.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center", color: "text.disabled" }}>
                  No directories found here.
                </Box>
              ) : (
                filteredDirectories.map((dir) => (
                  <ListItem
                    key={dir}
                    disablePadding
                    divider
                    sx={{ borderColor: "background.paper" }}
                  >
                    <ListItemButton
                      onClick={() => handleNavigate(dir)}
                      sx={{ color: "text.primary", py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FolderIcon sx={{ color: tokens.icon.folder, fontSize: 22 }} />
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

      <Divider sx={{ borderColor: "background.paper" }} />

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: tokens.surfaceSunken,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <Typography
          sx={{
            color: "text.disabled",
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
          sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelectCurrent}
          variant="contained"
          disabled={loading || !currentPath}
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#6366f1" },
            "&:disabled": { bgcolor: "background.paper", color: "text.disabled" },
          }}
        >
          Select Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
}
