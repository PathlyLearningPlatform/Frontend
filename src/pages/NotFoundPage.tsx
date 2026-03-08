import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import HomeIcon from '@mui/icons-material/Home'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 480 }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('common.notFound')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('common.notFoundDesc')}
        </Typography>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
          {t('common.backToDashboard')}
        </Button>
      </Paper>
    </Box>
  )
}
