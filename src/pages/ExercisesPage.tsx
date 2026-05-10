import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'
import { getActivities } from '../api'
import type { Activity } from '../types/api'
import { isActivityCompleted } from '../lib/activityProgress'
import { useLanguage } from '../context/LanguageContext'

export default function ExercisesPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [exercises, setExercises] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getActivities()
        setExercises(res.activities.filter((a) => (a.type ?? '').toUpperCase() === 'EXERCISE'))
      } catch {
        setError(t('exercises.fetchError'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [t])

  const difficultyConfig: Record<string, { label: string; color: string }> = {
    EASY:   { label: t('activity.easy'),   color: '#4CAF50' },
    MEDIUM: { label: t('activity.medium'), color: '#FF9800' },
    HARD:   { label: t('activity.hard'),   color: '#F44336' },
    easy:   { label: t('activity.easy'),   color: '#4CAF50' },
    medium: { label: t('activity.medium'), color: '#FF9800' },
    hard:   { label: t('activity.hard'),   color: '#F44336' },
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>{t('exercises.title')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{t('exercises.subtitle')}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : exercises.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FitnessCenterIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">{t('exercises.empty')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('exercises.emptyHint')}</Typography>
        </Paper>
      ) : (
        exercises.map((exercise) => {
          const difficulty = 'difficulty' in exercise
            ? (exercise as unknown as { difficulty: string }).difficulty
            : null
          const diffConfig = difficulty ? difficultyConfig[difficulty] : null
          const completed = isActivityCompleted(exercise.lessonId, exercise.id)

          return (
            <Paper
              key={exercise.id}
              sx={{
                p: 3, mb: 2, borderRadius: 3, cursor: 'pointer',
                borderLeft: completed ? '6px solid #4CAF50' : '6px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transform: 'translateX(4px)' },
              }}
              onClick={() => navigate(`/activities/exercise/${exercise.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#FF980015', color: '#FF9800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FitnessCenterIcon />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="h6" fontWeight={600} fontSize="1rem">{exercise.name}</Typography>
                      {completed && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                          label={t('exercises.completed')}
                          size="small"
                          color="success"
                          sx={{ height: 22 }}
                        />
                      )}
                      {diffConfig && (
                        <Chip
                          label={diffConfig.label}
                          size="small"
                          sx={{ height: 22, bgcolor: `${diffConfig.color}15`, color: diffConfig.color, fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    {exercise.description && (
                      <Typography variant="body2" color="text.secondary">{exercise.description}</Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="button" color="primary" fontWeight={700} sx={{ flexShrink: 0 }}>
                  {t('activity.start')}
                </Typography>
              </Box>
            </Paper>
          )
        })
      )}
    </>
  )
}