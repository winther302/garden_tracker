import React, { useState } from 'react';
import { Person } from '../types';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography } from '@mui/material';

interface CreateBedFormProps {
  people: Person[];
  onCreateBed: (name: string, assignedTo?: Person) => void;
}

const CreateBedForm: React.FC<CreateBedFormProps> = ({ people, onCreateBed }) => {
  const [name, setName] = useState('');
  const [assignedToId, setAssignedToId] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTo = people.find(p => p.id === assignedToId);
    onCreateBed(name, assignedTo);
    setName('');
    setAssignedToId('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Create New Bed</Typography>
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
          {people.map(person => (
            <MenuItem key={person.id} value={person.id}>
              {person.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Create Bed
      </Button>
    </form>
  );
};

export default CreateBedForm;