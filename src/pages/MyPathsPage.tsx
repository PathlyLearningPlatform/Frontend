import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SchoolIcon from '@mui/icons-material/School'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function MyPathsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('myPaths.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('myPaths.subtitle')}
      </Typography>

      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('myPaths.empty')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('myPaths.emptyHint')}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/explore')}>
          {t('myPaths.explore')}
        </Button>
      </Paper>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('myPaths.backendNote')}
        </Typography>
      </Box>
    </>
  )
}
