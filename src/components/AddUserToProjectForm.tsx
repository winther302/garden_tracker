import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';

interface AddUserToProjectFormProps {
  projectId: number;
  onUserAdded: () => void;
  onClose: () => void;
}

const AddUserToProjectForm: React.FC<AddUserToProjectFormProps> = ({
  projectId,
  onUserAdded,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/projects/${projectId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
        onUserAdded();
      } else {
        setError(data.error || 'Failed to add user');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="User Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        margin="normal"
        InputLabelProps={{
          style: { color: 'text.secondary' }, // Darker label color
        }}
        InputProps={{
          style: { color: 'text.primary' }, // Darker input text color
        }}
      />
      <Button type="submit" variant="contained" disableElevation color="primary" sx={{ mt: 2, mr: 1 }}>
        Add User
      </Button>
      <Button type="button" variant="contained" disableElevation onClick={onClose} sx={{ mt: 2 }}>
        Cancel
      </Button>
      {message && <Typography color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
      {error && <Typography color="error.main" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default AddUserToProjectForm;
