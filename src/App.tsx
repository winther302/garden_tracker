import React, { useState, useEffect } from "react";
import BedDetail from "./components/BedDetail";
import CreateBedForm from "./components/CreateBedForm";
import CreateTaskForm from "./components/CreateTaskForm";
import Filter from "./components/Filter";
import { Bed, Task, Project, UserProject, User } from "./types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import CreateProjectForm from "./components/CreateProjectForm";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import AddUserToProjectForm from "./components/AddUserToProjectForm";
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
  Dialog,
  DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  Menu, // Added Menu
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from '@mui/icons-material/AccountCircle'; // Added AccountCircleIcon
import { jwtDecode } from "jwt-decode";


import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Check if the error message indicates JWT expiration
      if (error.response.data && error.response.data.message && error.response.data.message.includes('jwt expired')) {
        console.log('JWT expired. Redirecting to login.');
        localStorage.removeItem('token');
        // This part needs to be handled by the component state, not directly here.
        // For now, we'll just reject the promise and let the component handle the logout.
        // A more robust solution would involve a global state management or context API.
      }
    }
    return Promise.reject(error);
  }
);

const API_BASE_URL = "http://localhost:3001";

  

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  
  
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Added state and handlers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState<number | "">("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false); // New state for CreateProjectForm modal
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State for menu anchor

  // Derive currentProject from selectedProjectId and projects
  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || null;

  // Handler to create a new project (matches CreateProjectForm signature)
  const handleCreateProject = (name: string) => {
    const create = async () => {
      try {
        console.log('Attempting to create project with name:', name);
        const response = await axios.post<Project>(`${API_BASE_URL}/projects`, {
          name,
          beds: [],
          tasks: [],
        });
        console.log('Project creation successful. Response data:', response.data);
        setProjects((prev) => [...prev, response.data]);
        setSelectedProjectId(response.data.id);
      } catch (err) {
        console.error('Error creating project:', err);
      }
    };
    create();
  };

  // Handler to create a new bed (matches CreateBedForm signature)
  const handleCreateBed = (name: string, assignedToId?: number) => {
    if (!currentProject) return;
    const create = async () => {
      try {
        const response = await axios.post<Bed>(
          `${API_BASE_URL}/projects/${currentProject.id}/beds`,
          {
            name,
            assignedToId,
            tasks: [],
            completedTasks: [],
          },
        );
        // Refetch projects to update the state with assigned user
        const updatedProjectsResponse = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
        setProjects(updatedProjectsResponse.data);
      } catch (err) {
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
        // Refetch projects to update the state
        const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
        setProjects(response.data);
      } catch (err) {
        console.error(err);
      }
    })();
  };

  // Handler for assigning a task to a bed (signature matches BedDetail)
  const handleAssignTask = (bedId: number, task: Task) => {
    if (!currentProject) return;
    (async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/beds/${bedId}/tasks`,
          { taskId: task.id },
        );
        // For simplicity, just refetch projects or update state as needed
        // Here, we will just refetch all projects for now
        const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
        setProjects(response.data);
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
    console.log('Login successful. isLoggedIn set to true.');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const decodedToken: { userId: number } = jwtDecode(token);
        setCurrentUserId(decodedToken.userId);
        console.log('Token found and decoded. User ID:', decodedToken.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
        // Handle invalid token, e.g., log out user
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUserId !== null) {
      console.log('isLoggedIn is true and currentUserId is set. Attempting to fetch projects...');
      const fetchProjects = async () => {
        try {
          const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
          console.log('Fetched projects:', response.data);
          setProjects(response.data);
          if (response.data.length > 0) {
            // Ensure the selected project is still valid or select the first one
            const projectExists = response.data.some(p => p.id === selectedProjectId);
            if (!projectExists && response.data.length > 0) {
              setSelectedProjectId(response.data[0].id);
            } else if (response.data.length === 0) {
              setSelectedProjectId(null);
            }
          } else {
            setSelectedProjectId(null);
          }
        } catch (err) {
          console.error('Error fetching projects:', err);
          if (axios.isAxiosError(err) && err.response?.status === 403) {
            // If 403, assume token expired and log out
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setSelectedProjectId(null);
            console.log('Logged out due to 403 on project fetch.');
          }
        }
      };
      fetchProjects();
    }
  }, [isLoggedIn, currentUserId, selectedProjectId]);





  if (!isLoggedIn) {
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
        {showRegisterForm ? (
          <RegisterForm />
        ) : showLoginForm ? (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: "primary.dark", textAlign: "center" }}
            >
              Welcome to Garden Tracker!
            </Typography>
            <Button
              variant="contained"
              disableElevation
              onClick={() => setShowRegisterForm(true)}
              sx={{ mt: 2 }}
            >
              Register New User
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => setShowLoginForm(true)}
              sx={{ mt: 2, ml: 2 }}
            >
              Login
            </Button>
          </>
        )}
        {(showRegisterForm || showLoginForm) && (
          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              setShowRegisterForm(false);
              setShowLoginForm(false);
            }}
            sx={{ mt: 2 }}
          >
            Back
          </Button>
        )}
      </Box>
    );
  }

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
          sx={{ color: "text.primary", textAlign: "center" }}
        >
          No projects found. Please create a new project to get started.
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setShowCreateProjectForm(true)}
          sx={{ mt: 2 }}
        >
          Create New Project
        </Button>
        <Dialog open={showCreateProjectForm} onClose={() => setShowCreateProjectForm(false)}>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <CreateProjectForm
              onCreateProject={(name) => {
                handleCreateProject(name);
                setShowCreateProjectForm(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  const filteredBeds = currentProject?.beds?.filter((bed) => {
    const nameMatch = bed.name.toLowerCase().includes(nameFilter.toLowerCase());
    const assignedToMatch =
      assignedToFilter === "" || bed.assignedTo?.id === assignedToFilter;
    return nameMatch && assignedToMatch;
  }) || [];

  const isAdmin = currentProject?.users?.some(
    (up) => up.userId === currentUserId && up.role === "ADMIN",
  );

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
      <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
          backdropFilter: 'blur(10px)', // Frosted glass effect
          color: 'primary.main', // Ensure text color is readable
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)', // Subtle bottom border
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: 'text.primary' }} // Changed text color for readability
          >
            Garden Tracker
          </Typography>
          {isLoggedIn && (
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          )}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {isLoggedIn && (
              <MenuItem onClick={() => {
                setShowCreateProjectForm(true);
                setAnchorEl(null);
              }}>
                Create New Project
              </MenuItem>
            )}
            {currentProject && isAdmin && (
              <MenuItem onClick={() => {
                setShowAddUserForm(true);
                setAnchorEl(null);
              }}>
                Add User to Project
              </MenuItem>
            )}
            {isLoggedIn && (
              <MenuItem onClick={() => {
                localStorage.removeItem('token');
                setIsLoggedIn(false);
                setSelectedProjectId(null);
                setAnchorEl(null);
              }}>
                Logout
              </MenuItem>
            )}
          </Menu>
          {!isLoggedIn && (
            <>
              <Button
                color="inherit"
                onClick={() => setShowRegisterForm(true)}
                sx={{ mr: 1 }}
              >
                Register
              </Button>
              <Button
                color="inherit"
                onClick={() => setShowLoginForm(true)}
              >
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>

      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
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
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
            Create New
          </Typography>
          <Paper sx={{ p: 3, mt: 2 }}>
            <CreateBedForm projectUsers={currentProject.users} onCreateBed={handleCreateBed} />
          </Paper>
          <Divider sx={{ my: 2 }} />
          <Paper sx={{ p: 3, mt: 3 }}>
            <CreateTaskForm onCreateTask={handleCreateTask} />
          </Paper>
        </Box>
      </Drawer>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Filter
              people={currentProject.users.map(up => ({ id: up.userId, email: up.user?.email || 'Unknown' }))}
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              assignedToFilter={assignedToFilter}
              onAssignedToFilterChange={setAssignedToFilter}
              onClearFilters={() => {
                setNameFilter("");
                setAssignedToFilter("");
              }}
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

      {currentProject && (
        <Dialog open={showAddUserForm} onClose={() => setShowAddUserForm(false)}>
          <DialogTitle>Add User to {currentProject.name}</DialogTitle>
          <DialogContent>
            <AddUserToProjectForm
              projectId={currentProject.id}
              onUserAdded={async () => {
                setShowAddUserForm(false);
                // Refetch projects to update the user list
                try {
                  const response = await axios.get<Project[]>(`${API_BASE_URL}/projects`);
                  setProjects(response.data);
                } catch (err) {
                  console.error('Error refetching projects after adding user:', err);
                }
              }}
              onClose={() => setShowAddUserForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showCreateProjectForm} onClose={() => setShowCreateProjectForm(false)}>
        <DialogTitle sx={{ color: 'text.primary' }}>Create New Project</DialogTitle>
        <DialogContent>
          <CreateProjectForm
            onCreateProject={(name) => {
              handleCreateProject(name);
              setShowCreateProjectForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;
