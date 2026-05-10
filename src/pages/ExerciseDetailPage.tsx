import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import Button from '@mui/material/Button'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson, completeActivity } from '../api'
import type { Activity, Lesson } from '../types/api'
import { useLanguage } from '../context/LanguageContext'
import { useSnackbar } from '../context/SnackbarContext'
import { isActivityCompleted, markActivityCompleted } from '../lib/activityProgress'
import { useActivityNavigation } from '../hooks/useActivityNavigation' 
import ActivityNavBar from '../components/ActivityNavBar'                

const difficultyConfig: Record<string, { labelKey: string; color: string }> = {
  EASY: { labelKey: 'difficulty.easy', color: '#4CAF50' },
  MEDIUM: { labelKey: 'difficulty.medium', color: '#FF9800' },
  HARD: { labelKey: 'difficulty.hard', color: '#F44336' },
  easy: { labelKey: 'difficulty.easy', color: '#4CAF50' },
  medium: { labelKey: 'difficulty.medium', color: '#FF9800' },
  hard: { labelKey: 'difficulty.hard', color: '#F44336' },
}

export default function ExerciseDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { showSnackbar } = useSnackbar()

  const { currentIndex, totalCount, hasPrev, hasNext, isLast, goNext, goPrev, goToLesson } =
    useActivityNavigation(activityId)

  const [exercise, setExercise] = useState<Activity | null>(null)
  const [completed, setCompleted] = useState(false)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    try {
      const data = await getActivity(activityId)
      setExercise(data.activity)
      setCompleted(isActivityCompleted(data.activity.lessonId, data.activity.id))
      try {
        const lessonData = await getLesson(data.activity.lessonId)
        setParentLesson(lessonData.lesson)
      } catch { /* fallback */ }
    } catch {
      setError(t('error.fetchExercise' as any) || 'Nie udało się pobrać danych ćwiczenia.')
    } finally {
      setLoading(false)
    }
  }, [activityId, t])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <DetailSkeleton />
  if (!exercise) return <Alert severity="error">{t('error.notFound' as any) || 'Nie znaleziono.'}</Alert>

  const difficulty = 'difficulty' in exercise
    ? (exercise as unknown as { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }).difficulty
    : null
  const config = difficulty ? difficultyConfig[difficulty] : null

  const handleComplete = async () => {
    if (!exercise) return
    try {
      await completeActivity(exercise.id)
      markActivityCompleted(exercise.lessonId, exercise.id)
      setCompleted(true)
      showSnackbar(t('activity.progressSaved'))
    } catch {
      showSnackbar(t('error.saveProgress' as any) || 'Nie udało się zapisać postępu', 'error')
    }
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          {t('nav.dashboard' as any)}
        </Link>
        {parentLesson && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={goToLesson}>
            {parentLesson.name}
          </Link>
        )}
        <Typography color="text.primary">{exercise.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <FitnessCenterIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{exercise.name}</Typography>
          <Chip 
            label={t('exercise.title' as any) || 'Ćwiczenie'} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
        </Box>
        {exercise.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {exercise.description}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 4 }}>
        {config && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('activity.details' as any) || 'Szczegóły'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">{t('activity.difficulty' as any) || 'Poziom trudności'}:</Typography>
              <Chip
                label={t(config.labelKey as any) || config.labelKey}
                sx={{ bgcolor: `${config.color}15`, color: config.color, fontWeight: 600, fontSize: '0.9rem' }}
              />
            </Box>
          </>
        )}
        <Box sx={{ mt: 3 }}>
          {completed ? (
            <Chip icon={<CheckCircleIcon />} label={t('activity.alreadyCompleted')} color="success" variant="outlined" />
          ) : (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleComplete}
            >
              {t('activity.markComplete')}
            </Button>
          )}
        </Box>

        <ActivityNavBar
          currentIndex={currentIndex}
          totalCount={totalCount}
          hasPrev={hasPrev}
          hasNext={hasNext}
          isLast={isLast}
          onPrev={goPrev}
          onNext={goNext}
          onGoToLesson={goToLesson}
          requireCompletion={false}
          isCompleted={completed}
        />
      </Paper>
    </>
  )
}