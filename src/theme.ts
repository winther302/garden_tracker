import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    glassmorphism: {
      background: string;
      backdropFilter: string;
      border: string;
      boxShadow: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    glassmorphism?: {
      background?: string;
      backdropFilter?: string;
      border?: string;
      boxShadow?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#66BB6A', // A fresh, vibrant green
    },
    secondary: {
      main: '#AED581', // A lighter, softer green
    },
    background: {
      default: '#E8F5E9', // Very light green for overall background
      paper: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for glass effect
    },
    text: {
      primary: '#2E7D32', // Dark green for primary text
      secondary: '#558B2F', // Muted green for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontSize: '2.8rem',
      fontWeight: 700,
      color: '#1B5E20',
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '1.6rem',
      fontWeight: 600,
      color: '#388E3C',
    },
    h6: {
      fontSize: '1.3rem',
      fontWeight: 600,
      color: '#4CAF50',
    },
    body1: {
      fontSize: '1rem',
      color: '#424242',
    },
  },
  shape: {
    borderRadius: 16, // More rounded corners for a modern feel
  },
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({
          ownerState,
          theme
        }) => ({
          ...(ownerState.variant === 'elevation' && {
            background: theme.glassmorphism.background,
            backdropFilter: theme.glassmorphism.backdropFilter,
            border: theme.glassmorphism.border,
            boxShadow: theme.glassmorphism.boxShadow,
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({
          ownerState,
          theme
        }) => ({
          ...(ownerState.variant === 'elevation' && {
            background: theme.glassmorphism.background,
            backdropFilter: theme.glassmorphism.backdropFilter,
            border: theme.glassmorphism.border,
            boxShadow: theme.glassmorphism.boxShadow,
          }),
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& .MuiFilledInput-root': {
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.4)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.6)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.7)',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'filled',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.4)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.6)',
          },
          '&.Mui-focused': {
            background: 'rgba(255, 255, 255, 0.7)',
          },
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        root: ({
          ownerState,
          theme
        }) => ({
          ...(ownerState.variant === 'elevation' && {
            background: theme.glassmorphism.background,
            backdropFilter: theme.glassmorphism.backdropFilter,
            border: theme.glassmorphism.border,
            boxShadow: theme.glassmorphism.boxShadow,
          }),
          '&:before': {
            display: 'none',
          },
        }),
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          background: '#4CAF50', // Green for success snackbar
        },
      },
    },
  },
});

export default theme;