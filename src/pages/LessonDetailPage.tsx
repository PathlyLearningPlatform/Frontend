import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArticleIcon from '@mui/icons-material/Article'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import QuizIcon from '@mui/icons-material/Quiz'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, getUnit, getActivities, deleteActivity, updateArticle, updateExercise, updateQuiz } from '../api'
import type { Lesson, Activity, Unit } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import ActivityFormDialog from '../components/ActivityFormDialog'
import SortableList from '../components/SortableList'
import { useSnackbar } from '../context/SnackbarContext'

const typeConfig = {
  article: { label: 'Artykuł', icon: ArticleIcon, color: '#2196F3' },
  exercise: { label: 'Ćwiczenie', icon: FitnessCenterIcon, color: '#FF9800' },
  quiz: { label: 'Quiz', icon: QuizIcon, color: '#9C27B0' },
} as const

const difficultyLabels = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
} as const

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [parentUnit, setParentUnit] = useState<Unit | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined)

  const fetchData = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    try {
      const [lessonData, activitiesData] = await Promise.all([
        getLesson(lessonId),
        getActivities(),
      ])
      setLesson(lessonData.lesson)
      try {
        const unitData = await getUnit(lessonData.lesson.unitId)
        setParentUnit(unitData.unit)
      } catch { /* breadcrumbs fallback */ }
      setActivities(
        activitiesData.activities
          .filter((a) => a.lessonId === lessonId)
          .sort((a, b) => a.order - b.order)
      )
    } catch {
      setError('Nie udało się pobrać danych.')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteActivity = async () => {
    if (!deleteActivityId) return
    const removedId = deleteActivityId
    setActivities((prev) => prev.filter((a) => a.id !== removedId))
    setDeleteActivityId(null)
    try {
      await deleteActivity(removedId)
      showSnackbar('Aktywność usunięta')
    } catch {
      setError('Nie udało się usunąć aktywności.')
      fetchData()
    }
  }

  const handleActivitySave = (activity: Activity) => {
    if (editingActivity) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a)).sort((a, b) => a.order - b.order)
      )
      showSnackbar('Aktywność zaktualizowana')
    } else {
      setActivities((prev) => [...prev, activity].sort((a, b) => a.order - b.order))
      showSnackbar('Aktywność dodana')
    }
  }

  const handleReorderActivities = (reordered: Activity[]) => {
    const updated = reordered.map((a, i) => ({ ...a, order: i + 1 }))
    setActivities(updated)
    updated.forEach((a) => {
      const payload = { order: a.order }
      if (a.type === 'article') updateArticle(a.id, payload).catch(() => {})
      else if (a.type === 'exercise') updateExercise(a.id, payload).catch(() => {})
      else updateQuiz(a.id, payload).catch(() => {})
    })
    showSnackbar('Kolejność aktywności zmieniona')
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (!lesson) {
    return <Alert severity="error">Nie znaleziono lekcji.</Alert>
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        {parentUnit && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/units/${parentUnit.id}`)}>
            {parentUnit.name}
          </Link>
        )}
        <Typography color="text.primary">{lesson.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #FF6584 0%, #FF8FA3 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <LibraryBooksIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {lesson.name}
          </Typography>
        </Box>
        {lesson.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {lesson.description}
          </Typography>
        )}
        <Chip
          label={`${activities.length} aktywności`}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Paper>

      {/* Activities list */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Aktywności</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingActivity(undefined)
            setActivityDialogOpen(true)
          }}
        >
          Dodaj aktywność
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak aktywności
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Dodaj pierwszą aktywność do tej lekcji
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingActivity(undefined)
              setActivityDialogOpen(true)
            }}
          >
            Dodaj aktywność
          </Button>
        </Paper>
      ) : (
        <SortableList
          items={activities}
          onReorder={handleReorderActivities}
          renderItem={(activity) => {
            const config = typeConfig[activity.type]
            const Icon = config.icon
            return (
              <Paper
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${config.color}15`,
                      color: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {activity.name}
                      </Typography>
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          bgcolor: `${config.color}15`,
                          color: config.color,
                        }}
                      />
                      {activity.type === 'exercise' && 'difficulty' in activity && (
                        <Chip
                          label={difficultyLabels[(activity as unknown as { difficulty: 'easy' | 'medium' | 'hard' }).difficulty]}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    )}
                    {activity.type === 'article' && 'ref' in activity && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                      >
                        <OpenInNewIcon sx={{ fontSize: 14 }} />
                        {(activity as unknown as { ref: string }).ref}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingActivity(activity)
                        setActivityDialogOpen(true)
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteActivityId(activity.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            )
          }}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteActivityId !== null}
        title="Usuń aktywność"
        message="Czy na pewno chcesz usunąć tę aktywność?"
        onConfirm={handleDeleteActivity}
        onCancel={() => setDeleteActivityId(null)}
      />
      <ActivityFormDialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        onSave={handleActivitySave}
        lessonId={lessonId!}
        activity={editingActivity}
        nextOrder={activities.length + 1}
      />
    </>
  )
}
