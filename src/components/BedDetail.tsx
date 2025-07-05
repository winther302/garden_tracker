import React, { useState } from 'react';
import { Bed, Task } from '../types';
import { Button, Card, CardContent, Typography, List, ListItem, ListItemText, Divider, Accordion, AccordionSummary, AccordionDetails, Snackbar, Autocomplete, TextField, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { calculateNextDueDate } from '../utils/taskUtils';


const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props, ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface BedDetailProps {
  bed: Bed;
  onTaskDone: (bed: Bed, task: Task) => void;
  onAssignTask: (bedId: number, task: Task) => void;
  allTasks: Task[];
  sx?: SxProps<Theme>;
}

const BedDetail: React.FC<BedDetailProps> = ({ bed, onTaskDone, onAssignTask, allTasks, sx }) => {
  const sortedCompletedTasks = [...bed.completedTasks].map(task => ({
    ...task,
    completedAt: new Date(task.completedAt)
  })).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);

  const handleTaskDoneClick = (task: Task) => {
    onTaskDone(bed, task);
    setOpenSnackbar(true);
  };

  const handleAssignTaskClick = () => {
    if (taskToAssign) {
      onAssignTask(bed.id, taskToAssign);
      setTaskToAssign(null);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const sortedAssignedTasks = [...bed.tasks].sort((a, b) => {
    const dateA = calculateNextDueDate(a, bed.completedTasks);
    const dateB = calculateNextDueDate(b, bed.completedTasks);

    if (dateA === null && dateB === null) return 0;
    if (dateA === null) return 1; // null dates go to the end
    if (dateB === null) return -1; // null dates go to the end

    // If dateA is null, it should come after dateB (unless dateB is also null)
    if (dateA === null) {
      return dateB === null ? 0 : 1; // If dateB is null, they are equal. Otherwise, dateA comes after dateB.
    }
    // If dateB is null (and dateA is not null, due to previous check), dateB should come after dateA
    if (dateB === null) {
      return -1; // dateA comes before dateB
    }

    // Both are valid Date objects, compare their times
    console.log('dateA:', dateA, 'dateB:', dateB);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card sx={{ ...sx, breakInside: 'avoid-column' }}>
      <CardContent sx={{ p: 1 }}>
        <Typography variant="h5">{bed.name}</Typography>
        <Typography color="textSecondary">
          Assigned to: {bed.assignedTo?.name || 'Unassigned'}
        </Typography>
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="completed-tasks-content"
            id="completed-tasks-header"
          >
            <Typography variant="h6">Completed Tasks</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {sortedCompletedTasks.map((completedTask, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={completedTask.task.name}
                    secondary={completedTask.completedAt.toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        <Divider sx={{ my: 2 }} />
        <Accordion defaultExpanded disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="assigned-tasks-content"
            id="assigned-tasks-header"
          >
            <Typography variant="h6">Assigned Tasks</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {sortedAssignedTasks.map(task => {
                const nextDueDate = calculateNextDueDate(task, bed.completedTasks);
                return (
                  <ListItem key={task.id}>
                    <ListItemText
                      primary={task.name}
                      secondary={nextDueDate ? `Due: ${nextDueDate.toLocaleDateString()}` : 'No due date'}
                    />
                    <Button variant="contained" size="small" onClick={() => handleTaskDoneClick(task)}>
                      Done
                    </Button>
                  </ListItem>
                );
              })}
            </List>
          </AccordionDetails>
        </Accordion>
        <Divider sx={{ my: 2 }} />
        <Accordion disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="assign-task-content"
            id="assign-task-header"
          >
            <Typography variant="h6">Assign Existing Task</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              options={allTasks.filter(task => !bed.tasks.some(t => t.id === task.id))}
              getOptionLabel={(option) => option.name}
              value={taskToAssign}
              onChange={(event, newValue) => {
                setTaskToAssign(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select a task to assign" margin="normal" fullWidth />
              )}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignTaskClick}
              disabled={!taskToAssign}
              sx={{ mt: 2 }}
            >
              Assign Task
            </Button>
          </AccordionDetails>
        </Accordion>
        
      </CardContent>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Task completed successfully!
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default BedDetail;