import React, { useState, useEffect } from "react";
import BedDetail from "./components/BedDetail";
import CreateBedForm from "./components/CreateBedForm";
import CreateTaskForm from "./components/CreateTaskForm";
import Filter from "./components/Filter";
import { Bed, Person, Task, Project } from "./types";
import CreateProjectForm from "./components/CreateProjectForm";
import RegisterForm from "./components/RegisterForm";
import {
  Grid,
  Typography,
  Paper,
  Box,
  Button,
  Drawer,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { calculateNextDueDate } from "./utils/taskUtils";

import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const initialPeople: Person[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [people] = useState<Person[]>(initialPeople);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Added state and handlers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState<number | "">("");

  // Derive currentProject from selectedProjectId and projects
  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  // Handler to create a new project (matches CreateProjectForm signature)
  const handleCreateProject = (name: string) => {
    const create = async () => {
      try {
        const response = await axios.post<Project>(`${API_BASE_URL}/projects`, {
          name,
          beds: [],
          tasks: [],
        });
        setProjects((prev) => [...prev, response.data]);
        setSelectedProjectId(response.data.id);
      } catch (err) {
        setError("Failed to create project.");
        console.error(err);
      }
    };
    create();
  };

  // Handler to create a new bed (matches CreateBedForm signature)
  const handleCreateBed = (name: string, assignedTo?: Person) => {
    if (!currentProject) return;
    const create = async () => {
      try {
        const response = await axios.post<Bed>(
          `${API_BASE_URL}/projects/${currentProject.id}/beds`,
          {
            name,
            assignedTo,
            tasks: [],
            completedTasks: [],
          },
        );
        setProjects((prev) =>
          prev.map((project) =>
            project.id === currentProject.id
              ? { ...project, beds: [...project.beds, response.data] }
              : project,
          ),
        );
      } catch (err) {
        setError("Failed to create bed.");
        console.error(err);
      }
    };
    create();
  };

  // Handler to create a new task (matches CreateTaskForm signature)
  const handleCreateTask = (
    name: string,
    dueDate?: Date,
    frequency?: string,
  ) => {
    if (!currentProject) return;
    const create = async () => {
      try {
        const response = await axios.post<Task>(
          `${API_BASE_URL}/projects/${currentProject.id}/tasks`,
          {
            name,
            dueDate,
            frequency,
          },
        );
        setProjects((prev) =>
          prev.map((project) =>
            project.id === currentProject.id
              ? { ...project, tasks: [...project.tasks, response.data] }
              : project,
          ),
        );
      } catch (err) {
        setError("Failed to create task.");
        console.error(err);
      }
    };
    create();
  };

  // Handler for marking a task as done (signature matches BedDetail)
  const handleTaskDone = (bed: Bed, task: Task) => {
    if (!currentProject) return;
    (async () => {
      try {
        await axios.patch(
          `${API_BASE_URL}/projects/${currentProject.id}/beds/${bed.id}/tasks/${task.id}/done`,
        );
        setProjects((prev) =>
          prev.map((project) =>
            project.id === currentProject.id
              ? {
                  ...project,
                  beds: project.beds.map((b) =>
                    b.id === bed.id
                      ? {
                          ...b,
                          tasks: b.tasks.map((t) =>
                            t.id === task.id ? { ...t, done: true } : t,
                          ),
                        }
                      : b,
                  ),
                }
              : project,
          ),
        );
      } catch (err) {
        setError("Failed to mark task as done.");
        console.error(err);
      }
    })();
  };

  // Handler for assigning a task to a bed (signature matches BedDetail)
  const handleAssignTask = (bedId: number, task: Task) => {
    if (!currentProject) return;
    (async () => {
      try {
        await axios.patch(
          `${API_BASE_URL}/projects/${currentProject.id}/beds/${bedId}/tasks/${task.id}/assign`,
        );
        // For simplicity, just refetch projects or update state as needed
        // Here, we will just refetch all projects for now
        const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
        setProjects(response.data);
      } catch (err) {
        setError("Failed to assign task.");
        console.error(err);
      }
    })();
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProjectId(response.data[0].id);
        }
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (!currentProject) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage:
            "url(https://source.unsplash.com/random/1920x1080/?garden,nature)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "primary.dark", textAlign: "center" }}
        >
          No projects found. Please create a new project to get started.
        </Typography>
        <Paper sx={{ p: 3, mt: 3, maxWidth: 400, width: "100%" }}>
          <CreateProjectForm onCreateProject={handleCreateProject} />
        </Paper>
        <Button
          variant="contained"
          onClick={() => setShowRegisterForm(true)}
          sx={{ mt: 2 }}
        >
          Register New User
        </Button>
      </Box>
    );
  }

  const filteredBeds = currentProject.beds.filter((bed) => {
    const nameMatch = bed.name.toLowerCase().includes(nameFilter.toLowerCase());
    const assignedToMatch =
      assignedToFilter === "" || bed.assignedTo?.id === assignedToFilter;
    return nameMatch && assignedToMatch;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          "url(https://source.unsplash.com/random/1920x1080/?garden,nature)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setSidebarOpen(true)}
          edge="start"
          sx={{ mr: 2, color: "primary.dark" }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ color: "primary.dark" }}
        >
          Garden Tracker
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowRegisterForm(true)}
          sx={{ ml: "auto" }}
        >
          Register
        </Button>
      </Box>

      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Projects
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value as number)}
              label="Select Project"
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Create New
          </Typography>
          <Paper sx={{ p: 3, mt: 2 }}>
            <CreateBedForm people={people} onCreateBed={handleCreateBed} />
          </Paper>
          <Paper sx={{ p: 3, mt: 3 }}>
            <CreateTaskForm onCreateTask={handleCreateTask} />
          </Paper>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 3, mt: 3 }}>
            <CreateProjectForm onCreateProject={handleCreateProject} />
          </Paper>
        </Box>
      </Drawer>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Filter
              people={people}
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              assignedToFilter={assignedToFilter}
              onAssignedToFilterChange={setAssignedToFilter}
            />
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            columnCount: { xs: 1, sm: 2, md: 3 }, // Responsive column count
            columnGap: 4, // Gap between columns
          }}
        >
          {filteredBeds.map((bed) => (
            <BedDetail
              key={bed.id}
              bed={bed}
              onTaskDone={handleTaskDone}
              onAssignTask={handleAssignTask}
              allTasks={currentProject.tasks}
              sx={{ mb: 4 }}
            />
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
