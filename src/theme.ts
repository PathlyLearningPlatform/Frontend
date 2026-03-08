import { createTheme, alpha } from '@mui/material/styles'

export function createAppTheme(darkMode: boolean) {
  const primaryMain = '#6C63FF'
  const primaryLight = '#9590FF'
  const primaryDark = '#4B45B2'
  const secondaryMain = '#FF6584'

  const glassBg = darkMode
    ? 'rgba(18, 18, 35, 0.5)'
    : 'rgba(255, 255, 255, 0.4)'
  const glassBorder = darkMode
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.55)'
  const glassInsetShadow = darkMode
    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    : 'inset 0 1px 0 rgba(255, 255, 255, 0.7)'

  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: primaryDark,
      },
      secondary: {
        main: secondaryMain,
      },
      success: {
        main: '#36D399',
      },
      info: {
        main: '#00D2FF',
      },
      background: darkMode
        ? {
            default: '#0B0B14',
            paper: 'rgba(18, 18, 35, 0.5)',
          }
        : {
            default: '#EEF0F8',
            paper: 'rgba(255, 255, 255, 0.4)',
          },
      text: darkMode
        ? {
            primary: '#E8E8F0',
            secondary: '#9898B0',
          }
        : {
            primary: '#1A1A2E',
            secondary: '#5E5E7A',
          },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 700,
      },
      subtitle1: {
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
            borderRadius: 10,
            padding: '8px 20px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          contained: {
            boxShadow: `0 4px 14px ${alpha(primaryMain, 0.35)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(primaryMain, 0.45)}`,
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderWidth: 2,
            backdropFilter: 'blur(12px)',
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: glassBorder,
            background: glassBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: darkMode
              ? `0 4px 24px rgba(0, 0, 0, 0.3), ${glassInsetShadow}`
              : `0 4px 24px rgba(108, 99, 255, 0.06), ${glassInsetShadow}`,
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: darkMode
                ? `0 12px 40px rgba(108, 99, 255, 0.2), ${glassInsetShadow}`
                : `0 12px 40px rgba(108, 99, 255, 0.12), ${glassInsetShadow}`,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: glassBorder,
            background: glassBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            backgroundImage: 'none',
            boxShadow: darkMode
              ? `0 4px 24px rgba(0, 0, 0, 0.25), ${glassInsetShadow}`
              : `0 4px 24px rgba(108, 99, 255, 0.05), ${glassInsetShadow}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            height: 6,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            border: glassBorder,
            background: darkMode ? 'rgba(18, 18, 35, 0.8)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: darkMode
              ? `0 24px 48px rgba(0,0,0,0.5), ${glassInsetShadow}`
              : `0 24px 48px rgba(108,99,255,0.1), ${glassInsetShadow}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'box-shadow 0.2s',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.15)}`,
              },
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}
