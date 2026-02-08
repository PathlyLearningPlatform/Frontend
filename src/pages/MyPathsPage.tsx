import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SchoolIcon from '@mui/icons-material/School'
import { useNavigate } from 'react-router-dom'

export default function MyPathsPage() {
  const navigate = useNavigate()

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Moje ścieżki
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ścieżki nauki, na które jesteś zapisana
      </Typography>

      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nie masz jeszcze żadnych ścieżek
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Przeglądaj dostępne ścieżki i zacznij naukę
        </Typography>
        <Button variant="contained" onClick={() => navigate('/explore')}>
          Przeglądaj ścieżki
        </Button>
      </Paper>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Ta funkcja wymaga systemu zapisywania się na ścieżki w backendzie.
          Pojawi się, gdy backend będzie to obsługiwał.
        </Typography>
      </Box>
    </>
  )
}
