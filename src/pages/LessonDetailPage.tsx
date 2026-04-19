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
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinearProgress from '@mui/material/LinearProgress'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, getUnit, getActivities, deleteActivity, updateArticle, updateExercise, updateQuiz } from '../api'
import type { Lesson, Activity, Unit } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import ActivityFormDialog from '../components/ActivityFormDialog'
import SortableList from '../components/SortableList'
import { useSnackbar } from '../context/SnackbarContext'
import { useLanguage } from '../context/LanguageContext'
import {
  getCompletedActivityIds,
  lessonCompletionRatio,
  subscribeLessonProgress,
} from '../lib/activityProgress'

const typeIcons = {
  ARTICLE: { icon: ArticleIcon, color: '#2196F3' },
  EXERCISE: { icon: FitnessCenterIcon, color: '#FF9800' },
  QUIZ: { icon: QuizIcon, color: '#9C27B0' },
} as const

const difficultyKeys = {
  EASY: 'activity.easy',
  MEDIUM: 'activity.medium',
  HARD: 'activity.hard',
  easy: 'activity.easy',
  medium: 'activity.medium',
  hard: 'activity.hard',
} as const

const typeLabelKeys = {
  ARTICLE: 'activity.article',
  EXERCISE: 'activity.exercise',
  QUIZ: 'activity.quiz',
} as const

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const { t } = useLanguage()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [parentUnit, setParentUnit] = useState<Unit | null>(null)
  const [parentSection, setParentSection] = useState<any>(null)
  const [parentPath, setParentPath] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined)
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set())

  // Persist activity types in sessionStorage (backend doesn't return type)
  const saveTypeCache = (acts: Activity[]) => {
    const cache = JSON.parse(sessionStorage.getItem('activityTypes') ?? '{}')
    acts.forEach((a) => { if (a.type) cache[a.id] = a.type })
    sessionStorage.setItem('activityTypes', JSON.stringify(cache))
  }
  const applyTypeCache = (acts: Activity[]): Activity[] => {
    const cache = JSON.parse(sessionStorage.getItem('activityTypes') ?? '{}') as Record<string, string>
    return acts.map((a) => ({ ...a, type: a.type ?? cache[a.id] as Activity['type'] }))
  }

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
        const { getSection, getLearningPath } = await import('../api')
        const sectionData = await getSection(unitData.unit.sectionId)
        setParentSection(sectionData.section)
        const pathData = await getLearningPath(sectionData.section.learningPathId)
        setParentPath(pathData.path)
      } catch { /* breadcrumbs fallback */ }
      const filtered = activitiesData.activities
        .filter((a) => a.lessonId === lessonId)
        .sort((a, b) => a.order - b.order)
      setActivities(applyTypeCache(filtered))
    } catch {
      setError(t('lesson.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!lessonId) return
    const sync = () => setCompletedIds(getCompletedActivityIds(lessonId))
    sync()
    return subscribeLessonProgress(lessonId, sync)
  }, [lessonId])

  const handleDeleteActivity = async () => {
    if (!deleteActivityId) return
    const removedId = deleteActivityId
    setActivities((prev) => prev.filter((a) => a.id !== removedId))
    setDeleteActivityId(null)
    try {
      await deleteActivity(removedId)
      showSnackbar(t('activity.deleted'))
    } catch {
      setError(t('activity.deleteError'))
      fetchData()
    }
  }

  const handleActivitySave = (activity: Activity) => {
    saveTypeCache([activity])
    if (editingActivity) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activity : a)).sort((a, b) => a.order - b.order)
      )
      showSnackbar(t('activity.updated'))
    } else {
      setActivities((prev) => [...prev, activity].sort((a, b) => a.order - b.order))
      showSnackbar(t('activity.added'))
    }
  }

  const handleReorderActivities = (reordered: Activity[]) => {
    const updated = reordered.map((a, i) => ({ ...a, order: i + 1 }))
    setActivities(updated)
    updated.forEach((a) => {
      const payload = { order: a.order }
      const actType = (a.type ?? 'EXERCISE').toUpperCase()
      if (actType === 'ARTICLE') updateArticle(a.id, payload).catch(() => {})
      else if (actType === 'EXERCISE') updateExercise(a.id, payload).catch(() => {})
      else updateQuiz(a.id, payload).catch(() => {})
    })
    showSnackbar(t('activity.reordered'))
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (!lesson) {
    return <Alert severity="error">{t('lesson.notFound')}</Alert>
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          {t('nav.dashboard')}
        </Link>
        {parentPath && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/learning-paths/${parentPath.id}`)}>
            {parentPath.name}
          </Link>
        )}
        {parentSection && parentPath && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/learning-paths/${parentPath.id}`)}>
            {parentSection.name}
          </Link>
        )}
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
          label={`${activities.length} ${t('activity.count')}`}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
        {activities.length > 0 && (
          <Box sx={{ mt: 3, maxWidth: 480 }}>
            <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.95 }}>
              {t('activity.lessonProgress')}: {completedIds.size}/{activities.length} (
              {lessonCompletionRatio(lessonId!, activities.length)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={lessonCompletionRatio(lessonId!, activities.length)}
              sx={{
                height: 10,
                borderRadius: 1,
                bgcolor: 'rgba(255,255,255,0.25)',
                '& .MuiLinearProgress-bar': { bgcolor: 'white' },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Activities list */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{t('activity.activities')}</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingActivity(undefined)
            setActivityDialogOpen(true)
          }}
        >
          {t('activity.addActivity')}
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('activity.noActivities')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('activity.addFirst')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingActivity(undefined)
              setActivityDialogOpen(true)
            }}
          >
            {t('activity.addActivity')}
          </Button>
        </Paper>
      ) : (
        <SortableList
          items={activities}
          onReorder={handleReorderActivities}
          renderItem={(activity) => {
            const actType = (activity.type ?? 'EXERCISE').toUpperCase() as keyof typeof typeIcons
            const config = typeIcons[actType] ?? typeIcons.ARTICLE
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
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/activities/${(activity.type ?? 'exercise').toLowerCase()}/${activity.id}`)}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {activity.name}
                      </Typography>
                      {lessonId && completedIds.has(activity.id) && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '18px !important' }} />}
                          label={t('activity.completed')}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      )}
                      <Chip
                        label={t(typeLabelKeys[actType])}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          bgcolor: `${config.color}15`,
                          color: config.color,
                        }}
                      />
                      {actType === 'EXERCISE' && 'difficulty' in activity && (
                        <Chip
                          label={t(difficultyKeys[(activity as unknown as { difficulty: string }).difficulty as keyof typeof difficultyKeys] ?? 'activity.easy')}
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
                    {actType === 'ARTICLE' && 'ref' in activity && (
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingActivity(activity)
                        setActivityDialogOpen(true)
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteActivityId(activity.id)
                      }}
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
        title={t('delete.activity')}
        message={t('delete.activityMessage')}
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
