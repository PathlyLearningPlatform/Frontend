import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import SchoolIcon from '@mui/icons-material/School'
import RouteIcon from '@mui/icons-material/Route'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getLearningPathsProgress, getLearningPaths } from '../api'
import type { LearningPathProgress, LearningPath } from '../types/api'

export default function MyPathsPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [pathsProgress, setPathsProgress] = useState<LearningPathProgress[]>([])
  const [pathsMap, setPathsMap] = useState<Record<string, LearningPath>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const [progressRes, pathsRes] = await Promise.all([
          getLearningPathsProgress(),
          getLearningPaths(),
        ])
        setPathsProgress(progressRes.learningPathProgress)
        const map: Record<string, LearningPath> = {}
        pathsRes.paths.forEach((p) => { map[p.id] = p })
        setPathsMap(map)
      } catch {
        setError('Nie udało się pobrać ścieżek.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4">
          {t('myPaths.title')}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('myPaths.subtitle')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : pathsProgress.length === 0 ? (
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
      ) : (
        pathsProgress.map((progress) => {
          const path = pathsMap[progress.learningPathId]
          const pct = progress.totalSectionCount > 0
            ? Math.round((progress.completedSectionCount / progress.totalSectionCount) * 100)
            : 0
          return (
            <Paper
              key={progress.id}
              sx={{ p: 3, mb: 2, borderRadius: 3, cursor: 'pointer', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}
              onClick={() => navigate(`/learning-paths/${progress.learningPathId}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <RouteIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {path?.name ?? progress.learningPathId}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {progress.completedSectionCount}/{progress.totalSectionCount} sekcji
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
              {path?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {path.description}
                </Typography>
              )}
            </Paper>
          )
        })
      )}
    </>
  )
}