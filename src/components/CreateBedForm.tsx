import React, { useState } from 'react';
import { UserProject, User } from '../types';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface CreateBedFormProps {
  projectUsers: UserProject[];
  onCreateBed: (name: string, assignedToId?: number) => void;
}

const CreateBedForm: React.FC<CreateBedFormProps> = ({ projectUsers, onCreateBed }) => {
  const [name, setName] = useState('');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBed(name, assignedToId === '' ? undefined : Number(assignedToId));
    setName('');
    setAssignedToId('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Bed Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Assign To</InputLabel>
        <Select
          value={assignedToId}
          onChange={e => setAssignedToId(e.target.value as number | '')}
        >
          <MenuItem value=""><em>Unassigned</em></MenuItem>
          {projectUsers.map(userProject => (
            <MenuItem key={userProject.userId} value={userProject.userId}>
              {userProject.user?.email || `User ${userProject.userId}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" disableElevation color="primary">
        Create Bed
      </Button>
    </form>
  );
};

export default CreateBedForm;