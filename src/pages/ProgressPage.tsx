import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimerIcon from '@mui/icons-material/Timer'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useLanguage } from '../context/LanguageContext'

export default function ProgressPage() {
  const { t } = useLanguage()

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('progress.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('progress.subtitle')}
      </Typography>

      {/* Stats overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#6C63FF', mb: 1 }} />
            <Typography variant="h4">0</Typography>
            <Typography variant="body2" color="text.secondary">{t('progress.started')}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
            <Typography variant="h4">0</Typography>
            <Typography variant="body2" color="text.secondary">{t('progress.completed')}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <TimerIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
            <Typography variant="h4">0h</Typography>
            <Typography variant="body2" color="text.secondary">{t('progress.studyTime')}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 40, color: '#F44336', mb: 1 }} />
            <Typography variant="h4">0</Typography>
            <Typography variant="body2" color="text.secondary">{t('progress.achievements')}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Overall progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>{t('progress.overall')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={0}
            sx={{ flex: 1, height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
            0%
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('progress.backendNote')}
        </Typography>
      </Box>
    </>
  )
}
