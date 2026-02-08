import { createTheme } from '@mui/material/styles'

export function createAppTheme(darkMode: boolean) {
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#6C63FF',
        light: '#9590FF',
        dark: '#4B45B2',
      },
      secondary: {
        main: '#FF6584',
      },
      background: darkMode
        ? {
            default: '#121212',
            paper: '#1E1E1E',
          }
        : {
            default: '#F5F7FA',
            paper: '#FFFFFF',
          },
      text: darkMode
        ? {
            primary: '#E0E0E0',
            secondary: '#A0A0A0',
          }
        : {
            primary: '#2D3748',
            secondary: '#718096',
          },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode
              ? '0 2px 12px rgba(0,0,0,0.3)'
              : '0 2px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
  })
}
