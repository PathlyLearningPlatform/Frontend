import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import ArticleIcon from '@mui/icons-material/Article'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import QuizIcon from '@mui/icons-material/Quiz'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LinearProgress from '@mui/material/LinearProgress'
import { useParams, useNavigate } from 'react-router-dom'
import { getLesson, getUnit, getActivities } from '../api'
import type { Lesson, Activity, Unit } from '../types/api'
import SortableList from '../components/SortableList'
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
  const { t } = useLanguage()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [parentUnit, setParentUnit] = useState<Unit | null>(null)
  const [parentSection, setParentSection] = useState<any>(null)
  const [parentPath, setParentPath] = useState<any>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set())

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
      setActivities(filtered)
    } catch {
      setError(t('lesson.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [lessonId, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!lessonId) return
    const sync = () => setCompletedIds(getCompletedActivityIds(lessonId))
    sync()
    return subscribeLessonProgress(lessonId, sync)
  }, [lessonId])

  if (loading) return <DetailSkeleton />
  if (!lesson) return <Alert severity="error">{t('lesson.notFound')}</Alert>

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
        {parentUnit && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/units/${parentUnit.id}`)}>
            {parentUnit.name}
          </Link>
        )}
        <Typography color="text.primary">{lesson.name}</Typography>
      </Breadcrumbs>

      {/* Header z paskiem postępu */}
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
        <Box sx={{ mt: 3, maxWidth: 480 }}>
          <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.95 }}>
            {t('activity.lessonProgress')}: {completedIds.size}/{activities.length} ({lessonCompletionRatio(lessonId!, activities.length)}%)
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
      </Paper>

      <Typography variant="h5" sx={{ mb: 3 }}>{t('activity.activities')}</Typography>

      {activities.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {t('activity.noActivities')}
          </Typography>
        </Paper>
      ) : (
        <SortableList
          items={activities}
          onReorder={() => {}} // Wyłączone dla ucznia
          renderItem={(activity) => {
            const actType = (activity.type ?? 'EXERCISE').toUpperCase() as keyof typeof typeIcons
            const config = typeIcons[actType] ?? typeIcons.ARTICLE
            const Icon = config.icon
            const isCompleted = completedIds.has(activity.id)

            return (
              <Paper
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    transform: 'translateX(4px)'
                  },
                  borderLeft: isCompleted ? '6px solid #4CAF50' : '6px solid transparent'
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
                  onClick={() =>
                    navigate(
                      `/activities/${(activity.type ?? 'exercise').toLowerCase()}/${activity.id}`,
                      { state: { activities, lessonId } }  // ← dodajemy state
                    )
                  }
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
                      {isCompleted && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '18px !important' }} />}
                          label={t('activity.completed')}
                          size="small"
                          color="success"
                          sx={{ height: 24 }}
                        />
                      )}
                      <Chip
                        label={t(typeLabelKeys[actType])}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', bgcolor: `${config.color}15`, color: config.color }}
                      />
                    </Box>
                    {activity.description && (
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="button" color="primary" sx={{ fontWeight: 700, ml: 2 }}>
                    {t('activity.start')}
                  </Typography>
                </Box>
              </Paper>
            )
          }}
        />
      )}
    </>
  )
}