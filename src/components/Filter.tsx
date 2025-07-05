
import React from 'react';
import { Person } from '../types';
import { TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';

interface FilterProps {
  people: Person[];
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  assignedToFilter: number | '';
  onAssignedToFilterChange: (value: number | '') => void;
}

const Filter: React.FC<FilterProps> = ({
  people,
  nameFilter,
  onNameFilterChange,
  assignedToFilter,
  onAssignedToFilterChange,
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={6}>
        <TextField
          label="Filter by name"
          value={nameFilter}
          onChange={e => onNameFilterChange(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Filter by assigned person</InputLabel>
          <Select
            value={assignedToFilter}
            onChange={e => onAssignedToFilterChange(e.target.value as number | '')}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {people.map(person => (
              <MenuItem key={person.id} value={person.id}>
                {person.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default Filter;
