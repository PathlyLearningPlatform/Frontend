import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SchoolIcon from '@mui/icons-material/School'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function MyPathsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4">
          {t('myPaths.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/learning-paths/new')}
          sx={{
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.4)',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #5B53EE 0%, #8480EE 100%)',
              boxShadow: '0 8px 28px rgba(108, 99, 255, 0.5)',
            },
          }}
        >
          {t('nav.newPath')}
        </Button>
      </Box>

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
        <Button variant="outlined" onClick={() => navigate('/explore')}>
          {t('myPaths.explore')}
        </Button>
      </Paper>
    </>
  )
}