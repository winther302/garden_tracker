
import React from 'react';
import { User } from '../types';
import { TextField, Select, MenuItem, FormControl, InputLabel, Grid, Button } from '@mui/material';

interface FilterProps {
  people: User[];
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  assignedToFilter: number | '';
  onAssignedToFilterChange: (value: number | '') => void;
  onClearFilters: () => void;
}

const Filter: React.FC<FilterProps> = ({
  people,
  nameFilter,
  onNameFilterChange,
  assignedToFilter,
  onAssignedToFilterChange,
  onClearFilters,
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
      <Grid item xs={5}>
        <TextField
          label="Filter by name"
          value={nameFilter}
          onChange={e => onNameFilterChange(e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel>Filter by assigned person</InputLabel>
          <Select
            value={assignedToFilter}
            onChange={e => onAssignedToFilterChange(e.target.value as number | '')}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {people.map(person => (
              <MenuItem key={person.id} value={person.id}>
                {person.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <Button onClick={onClearFilters} variant="contained" disableElevation fullWidth sx={{ py: 1.9 }}>
          Clear
        </Button>
      </Grid>
    </Grid>
  );
};

export default Filter;
