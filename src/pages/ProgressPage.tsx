import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import TimerIcon from '@mui/icons-material/Timer'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RouteIcon from '@mui/icons-material/Route'
import { getLearningPathsProgress, getLessonProgress, getLearningPaths } from '../api'
import type { LearningPathProgress, LessonProgress, LearningPath } from '../types/api'
import { useLanguage } from '../context/LanguageContext'

export default function ProgressPage() {
  const { t } = useLanguage()
  const [pathsProgress, setPathsProgress] = useState<LearningPathProgress[]>([])
  const [lessonsProgress, setLessonsProgress] = useState<LessonProgress[]>([])
  const [pathsMap, setPathsMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const [pathsRes, lessonsRes, allPathsRes] = await Promise.all([
          getLearningPathsProgress(),
          getLessonProgress(),
          getLearningPaths(),
        ])
        setPathsProgress(pathsRes.learningPathProgress)
        setLessonsProgress(lessonsRes.lessonProgress)
        const map: Record<string, string> = {}
        allPathsRes.paths.forEach((p: LearningPath) => { map[p.id] = p.name })
        setPathsMap(map)
      } catch {
        setError('Nie udało się pobrać danych progresu.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const completedPaths = pathsProgress.filter(p => p.completedAt !== null).length
  const completedLessons = lessonsProgress.filter(l => l.completedAt !== null).length
  const totalLessons = lessonsProgress.length

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {t('progress.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('progress.subtitle')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#6C63FF' }} />, value: pathsProgress.length, label: t('progress.started') },
          { icon: <CheckCircleIcon sx={{ fontSize: 36, color: '#4CAF50' }} />, value: completedPaths, label: t('progress.completed') },
          { icon: <TimerIcon sx={{ fontSize: 36, color: '#FF9800' }} />, value: completedLessons, label: 'Ukończone lekcje' },
          { icon: <EmojiEventsIcon sx={{ fontSize: 36, color: '#F44336' }} />, value: totalLessons, label: 'Wszystkie lekcje' },
        ].map((stat, i) => (
          <Grid size={{ xs: 6, md: 3 }} key={i}>
            <Paper sx={{ p: 2.5, textAlign: 'center', borderRadius: 3 }}>
              {stat.icon}
              {loading
                ? <CircularProgress size={24} sx={{ mt: 1 }} />
                : <Typography variant="h4" sx={{ mt: 0.5 }}>{stat.value}</Typography>
              }
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Twoje ścieżki nauki</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : pathsProgress.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">Nie rozpoczęłaś jeszcze żadnej ścieżki nauki.</Typography>
        </Paper>
      ) : (
        pathsProgress.map((path) => {
          const pct = path.totalSectionCount > 0
            ? Math.round((path.completedSectionCount / path.totalSectionCount) * 100)
            : 0
          return (
            <Paper key={path.id} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <RouteIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {pathsMap[path.learningPathId] ?? 'Ładowanie...'}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {path.completedSectionCount}/{path.totalSectionCount} sekcji
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ minWidth: 36 }}>
                  {pct}%
                </Typography>
              </Box>
            </Paper>
          )
        })
      )}
    </>
  )
}