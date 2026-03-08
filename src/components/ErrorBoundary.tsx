import { Component, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 480 }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight={700}>
              Coś poszło nie tak
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 2.5, px: 4 }}
            >
              Odśwież stronę
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
