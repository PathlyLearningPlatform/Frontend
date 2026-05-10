import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import ArticleIcon from '@mui/icons-material/Article'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson, completeActivity } from '../api'
import type { Activity, Lesson } from '../types/api'
import { useLanguage } from '../context/LanguageContext'
import { useSnackbar } from '../context/SnackbarContext'
import { isActivityCompleted, markActivityCompleted } from '../lib/activityProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useActivityNavigation } from '../hooks/useActivityNavigation' 
import ActivityNavBar from '../components/ActivityNavBar'                

export default function ArticleDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { showSnackbar } = useSnackbar()

  const { currentIndex, totalCount, hasPrev, hasNext, isLast, goNext, goPrev, goToLesson } =
    useActivityNavigation(activityId)

  const [article, setArticle] = useState<Activity | null>(null)
  const [completed, setCompleted] = useState(false)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    try {
      const data = await getActivity(activityId)
      setArticle(data.activity)
      setCompleted(isActivityCompleted(data.activity.lessonId, data.activity.id))
      try {
        const lessonData = await getLesson(data.activity.lessonId)
        setParentLesson(lessonData.lesson)
      } catch { /* fallback */ }
    } catch {
      setError(t('error.fetchArticle' as any) || 'Nie udało się pobrać danych artykułu.')
    } finally {
      setLoading(false)
    }
  }, [activityId, t])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <DetailSkeleton />
  if (!article) return <Alert severity="error">{t('error.notFound' as any) || 'Nie znaleziono.'}</Alert>

  const ref = 'ref' in article ? (article as unknown as { ref: string }).ref : null

  const handleComplete = async () => {
    if (!article) return
    try {
      await completeActivity(article.id)
      markActivityCompleted(article.lessonId, article.id)
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
        <Typography color="text.primary">{article.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <ArticleIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{article.name}</Typography>
          <Chip 
            label={t('exercise.article' as any) || 'Artykuł'} 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
          />
        </Box>
        {article.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {article.description}
          </Typography>
        )}
      </Paper>

      {ref && (
        <Paper sx={{ p: 4, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('activity.material' as any) || 'Materiał'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <OpenInNewIcon color="primary" />
            <Link href={ref} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontSize: '1.1rem' }}>
              {ref}
            </Link>
          </Box>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            sx={{ mt: 3 }}
            href={ref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('activity.openMaterial' as any) || 'Otwórz materiał'}
          </Button>
        </Paper>
      )}

      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
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