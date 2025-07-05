import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';

interface CreateProjectFormProps {
  onCreateProject: (name: string) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onCreateProject }) => {
  const [projectName, setProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreateProject(projectName);
      setProjectName('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Create New Project</Typography>
      <TextField
        label="Project Name"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
        required
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Create Project
      </Button>
    </form>
  );
};

export default CreateProjectForm;
