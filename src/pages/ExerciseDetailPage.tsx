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
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson } from '../api'
import type { Activity, Lesson } from '../types/api'

const difficultyConfig: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Łatwy', color: '#4CAF50' },
  MEDIUM: { label: 'Średni', color: '#FF9800' },
  HARD: { label: 'Trudny', color: '#F44336' },
  easy: { label: 'Łatwy', color: '#4CAF50' },
  medium: { label: 'Średni', color: '#FF9800' },
  hard: { label: 'Trudny', color: '#F44336' },
}

export default function ExerciseDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()

  const [exercise, setExercise] = useState<Activity | null>(null)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    try {
      const data = await getActivity(activityId)
      setExercise(data.activity)
      try {
        const lessonData = await getLesson(data.activity.lessonId)
        setParentLesson(lessonData.lesson)
      } catch { /* fallback */ }
    } catch {
      setError('Nie udało się pobrać danych ćwiczenia.')
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <DetailSkeleton />
  if (!exercise) return <Alert severity="error">Nie znaleziono ćwiczenia.</Alert>

  const difficulty = 'difficulty' in exercise
    ? (exercise as unknown as { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }).difficulty
    : null
  const config = difficulty ? difficultyConfig[difficulty] : null

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        {parentLesson && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/lessons/${parentLesson.id}`)}>
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

      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <FitnessCenterIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {exercise.name}
          </Typography>
          <Chip label="Ćwiczenie" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
        {exercise.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {exercise.description}
          </Typography>
        )}
      </Paper>

      {config && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Szczegóły</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">Poziom trudności:</Typography>
            <Chip
              label={config.label}
              sx={{
                bgcolor: `${config.color}15`,
                color: config.color,
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
          </Box>
        </Paper>
      )}
    </>
  )
}
