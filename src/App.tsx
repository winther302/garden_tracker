import React, { useState } from 'react';
import BedDetail from './components/BedDetail';
import CreateBedForm from './components/CreateBedForm';
import CreateTaskForm from './components/CreateTaskForm';
import Filter from './components/Filter';
import { Bed, Person, Task, Project } from './types';
import CreateProjectForm from './components/CreateProjectForm';
import { Grid, Typography, Paper, Box, Button, Drawer, IconButton, Select, MenuItem, FormControl, InputLabel, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { calculateNextDueDate } from './utils/taskUtils';

const initialPeople: Person[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Home Garden',
    beds: [
      {
        id: 1,
        name: 'Strawberry Patch',
        assignedTo: initialPeople[0],
        tasks: [
          { id: 1, name: 'Watering', frequency: 'daily' },
          { id: 2, name: 'Weeding', frequency: 'weekly' },
        ],
        completedTasks: [],
      },
      {
        id: 2,
        name: 'Herb Garden',
        assignedTo: initialPeople[1],
        tasks: [
          { id: 1, name: 'Watering', frequency: 'daily' },
          { id: 3, name: 'Pest Control', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)) },
        ],
        completedTasks: [],
      },
    ],
    tasks: [
      { id: 1, name: 'Watering', frequency: 'daily' },
      { id: 2, name: 'Weeding', frequency: 'weekly' },
      { id: 3, name: 'Pest Control', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)) },
      { id: 4, name: 'Harvesting', dueDate: new Date(new Date().setDate(new Date().getDate() + 14)) },
    ],
  },
  {
    id: 2,
    name: 'Community Garden',
    beds: [
      {
        id: 4,
        name: 'Tomato Bed',
        assignedTo: initialPeople[0],
        tasks: [
          { id: 5, name: 'Pruning', frequency: 'weekly' },
        ],
        completedTasks: [],
      },
    ],
    tasks: [
      { id: 5, name: 'Pruning', frequency: 'weekly' },
      { id: 6, name: 'Fertilizing', dueDate: new Date(new Date().setDate(new Date().getDate() + 3)) },
    ],
  },
];

function App() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(initialProjects[0].id);
  const [people] = useState<Person[]>(initialPeople);
  const [nameFilter, setNameFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState<number | '' > ('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId);

  if (!currentProject) {
    return <Typography>Project not found.</Typography>;
  }

  const handleTaskDone = (bed: Bed, task: Task) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === selectedProjectId) {
          const updatedBeds = project.beds.map(b => {
            if (b.id === bed.id) {
              const newCompletedTasks = [...b.completedTasks, { task, completedAt: new Date() }];
              let newAssignedTasks = b.tasks.filter(t => t.id !== task.id);

              if (task.frequency) {
                const nextDueDate = calculateNextDueDate(task, newCompletedTasks);
                if (nextDueDate) {
                  newAssignedTasks.push({ ...task, dueDate: nextDueDate });
                }
              }

              return {
                ...b,
                tasks: newAssignedTasks,
                completedTasks: newCompletedTasks,
              };
            }
            return b;
          });
          return { ...project, beds: updatedBeds };
        }
        return project;
      })
    );
  };

  const handleCreateBed = (name: string, assignedTo?: Person) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === selectedProjectId) {
          const newBed: Bed = {
            id: project.beds.length > 0 ? Math.max(...project.beds.map(b => b.id)) + 1 : 1,
            name,
            assignedTo,
            tasks: currentProject.tasks, // Assign all available tasks from the current project
            completedTasks: [],
          };
          return { ...project, beds: [...project.beds, newBed] };
        }
        return project;
      })
    );
  };

  const handleCreateTask = (name: string, dueDate?: Date, frequency?: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === selectedProjectId) {
          const newTaskId = project.tasks.length > 0 ? Math.max(...project.tasks.map(t => t.id)) + 1 : 1;
          const newTask: Task = {
            id: newTaskId,
            name,
            dueDate,
            frequency,
          };
          return { ...project, tasks: [...project.tasks, newTask] };
        }
        return project;
      })
    );
  };

  const handleCreateProject = (name: string) => {
    setProjects(prevProjects => {
      const newProjectId = prevProjects.length > 0 ? Math.max(...prevProjects.map(p => p.id)) + 1 : 1;
      const newProject: Project = {
        id: newProjectId,
        name,
        beds: [],
        tasks: [],
      };
      return [...prevProjects, newProject];
    });
  };

  const handleAssignTask = (bedId: number, task: Task) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === selectedProjectId) {
          const updatedBeds = project.beds.map(b =>
            b.id === bedId ? { ...b, tasks: [...b.tasks, task] } : b
          );
          return { ...project, beds: updatedBeds };
        }
        return project;
      })
    );
  };

  const filteredBeds = currentProject.beds.filter(bed => {
    const nameMatch = bed.name.toLowerCase().includes(nameFilter.toLowerCase());
    const assignedToMatch = assignedToFilter === '' || bed.assignedTo?.id === assignedToFilter;
    return nameMatch && assignedToMatch;
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(https://source.unsplash.com/random/1920x1080/?garden,nature)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setSidebarOpen(true)}
          edge="start"
          sx={{ mr: 2, color: 'primary.dark' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.dark' }}>
          Garden Tracker
        </Typography>
      </Box>

      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>Projects</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value as number)}
              label="Select Project"
            >
              {projects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Create New</Typography>
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
        <Grid item xs={12} sx={{
          columnCount: { xs: 1, sm: 2, md: 3 }, // Responsive column count
          columnGap: 4, // Gap between columns
        }}>
          {filteredBeds.map(bed => (
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