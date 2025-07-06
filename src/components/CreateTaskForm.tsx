import React, { useState } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface CreateTaskFormProps {
  onCreateTask: (name: string, dueDate?: Date, frequency?: string) => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreateTask }) => {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDueDate = dueDate ? new Date(dueDate) : undefined;
    onCreateTask(name, parsedDueDate, frequency || undefined);
    setName('');
    setDueDate('');
    setFrequency('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Task Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Due Date (Optional)"
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Frequency (Optional)</InputLabel>
        <Select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          label="Frequency (Optional)"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="every 2 days">Every 2 Days</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" disableElevation color="primary" sx={{ mt: 2 }}>
        Create Task
      </Button>
    </form>
  );
};

export default CreateTaskForm;
