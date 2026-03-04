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
import { getActivity, getLesson } from '../api'
import type { Activity, Lesson } from '../types/api'

export default function ArticleDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()

  const [article, setArticle] = useState<Activity | null>(null)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    try {
      const data = await getActivity(activityId)
      setArticle(data.activity)
      try {
        const lessonData = await getLesson(data.activity.lessonId)
        setParentLesson(lessonData.lesson)
      } catch { /* fallback */ }
    } catch {
      setError('Nie udało się pobrać danych artykułu.')
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <DetailSkeleton />
  if (!article) return <Alert severity="error">Nie znaleziono artykułu.</Alert>

  const ref = 'ref' in article ? (article as unknown as { ref: string }).ref : null

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
        <Typography color="text.primary">{article.name}</Typography>
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
          background: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <ArticleIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {article.name}
          </Typography>
          <Chip label="Artykuł" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
        {article.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {article.description}
          </Typography>
        )}
      </Paper>

      {ref && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Materiał</Typography>
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
            Otwórz materiał
          </Button>
        </Paper>
      )}
    </>
  )
}
