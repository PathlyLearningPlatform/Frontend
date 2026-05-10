import { useState, useEffect, useCallback } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { DashboardSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import SearchIcon from '@mui/icons-material/Search'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import RouteIcon from '@mui/icons-material/Route'
import { motion } from 'framer-motion'
import { getLearningPaths, getLearningPathsProgress, getLessonProgress } from '../api'
import type { LearningPath, LearningPathProgress } from '../types/api'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const MotionBox = motion.create(Box)
const MotionPaper = motion.create(Paper)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [pathsProgress, setPathsProgress] = useState<LearningPathProgress[]>([])
  const [completedLessons, setCompletedLessons] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pathsRes, progressRes, lessonsRes] = await Promise.all([
        getLearningPaths(),
        getLearningPathsProgress().catch(() => ({ learningPathProgress: [] })),
        getLessonProgress().catch(() => ({ lessonProgress: [] })),
      ])
      setPaths(pathsRes.paths)
      setPathsProgress(progressRes.learningPathProgress)
      setCompletedLessons(
        lessonsRes.lessonProgress.filter(l => l.completedAt !== null).length
      )
    } catch {
      setError(t('dashboard.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const pathsMap = Object.fromEntries(paths.map(p => [p.id, p]))
  const inProgress = pathsProgress.filter(p => p.completedAt === null).length
  const completed = pathsProgress.filter(p => p.completedAt !== null).length

  const statCards = [
    {
      icon: <AutoStoriesIcon />,
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
      shadowColor: 'rgba(108, 99, 255, 0.3)',
      label: t('dashboard.available'),
      value: paths.length,
    },
    {
      icon: <TrendingUpIcon />,
      gradient: 'linear-gradient(135deg, #36D399 0%, #22B573 100%)',
      shadowColor: 'rgba(54, 211, 153, 0.3)',
      label: t('dashboard.inProgress'),
      value: inProgress,
    },
    {
      icon: <EmojiEventsIcon />,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      shadowColor: 'rgba(255, 152, 0, 0.3)',
      label: t('dashboard.completed'),
      value: completed,
    },
  ]

  const startedPathIds = new Set(pathsProgress.map(p => p.learningPathId))

  const filteredPaths = paths.filter(p =>
    startedPathIds.has(p.id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <MotionBox initial="hidden" animate="visible" variants={containerVariants}>
      {/* Welcome header */}
      <MotionBox
        variants={itemVariants}
        sx={{
          mb: 4, p: 4, borderRadius: 5, position: 'relative', overflow: 'hidden',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,210,255,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,210,255,0.04) 100%)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)'
            : 'inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 32px rgba(108,99,255,0.08)',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6C63FF 0%, #00D2FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {t('dashboard.welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {t('dashboard.subtitle')}
          </Typography>
        </Box>
      </MotionBox>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 4 }} key={i}>
            <MotionPaper
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.25 } }}
              sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5,
                '&:hover': { boxShadow: `0 16px 40px ${stat.shadowColor}` } }}
            >
              <Box sx={{
                width: 52, height: 52, borderRadius: 3, background: stat.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 16px ${stat.shadowColor}`, color: 'white',
              }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Box>
            </MotionPaper>
          </Grid>
        ))}
      </Grid>

      {/* My progress section */}
      {pathsProgress.length > 0 && (
        <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{t('dashboard.myProgress')}</Typography>
          {pathsProgress.map(progress => {
            const path = pathsMap[progress.learningPathId]
            const pct = progress.totalSectionCount > 0
              ? Math.round((progress.completedSectionCount / progress.totalSectionCount) * 100)
              : 0
            return (
              <Paper
                key={progress.learningPathId}
                sx={{ p: 3, mb: 2, borderRadius: 3, cursor: 'pointer',
                  '&:hover': { boxShadow: '0 4px 16px rgba(108,99,255,0.15)' } }}
                onClick={() => navigate(`/learning-paths/${progress.learningPathId}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <RouteIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {path?.name ?? progress.learningPathId}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Chip
                    size="small"
                    label={progress.completedAt ? 'Ukończona' : 'W trakcie'}
                    color={progress.completedAt ? 'success' : 'primary'}
                    variant="outlined"
                  />
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
              </Paper>
            )
          })}
        </MotionBox>
      )}

      {/* Search + all paths */}
      <MotionBox variants={itemVariants}>
        <TextField
          fullWidth
          placeholder={t('dashboard.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              transition: 'all 0.3s',
              '&:hover': { boxShadow: '0 4px 20px rgba(108, 99, 255, 0.15)' },
            },
          }}
        />
      </MotionBox>

      <MotionBox variants={itemVariants} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('dashboard.myPaths')}</Typography>
        <Chip label={filteredPaths.length} size="small" sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, #6C63FF, #9590FF)',
          color: 'white',
        }} />
      </MotionBox>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <DashboardSkeleton />
      ) : filteredPaths.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={700}>
            {search ? t('dashboard.noPathsFound') : t('dashboard.noPaths')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? t('dashboard.changeSearch') : t('dashboard.createFirst')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPaths.map((path) => {
            const progress = pathsProgress.find(p => p.learningPathId === path.id)
            const pct = progress && progress.totalSectionCount > 0
              ? Math.round((progress.completedSectionCount / progress.totalSectionCount) * 100)
              : null
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={path.id}>
                <MotionPaper
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  sx={{ p: 3, borderRadius: 3, cursor: 'pointer', height: '100%',
                    '&:hover': { boxShadow: '0 8px 32px rgba(108,99,255,0.15)' } }}
                  onClick={() => navigate(`/learning-paths/${path.id}`)}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {path.name}
                  </Typography>
                  {path.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {path.description}
                    </Typography>
                  )}
                  {pct !== null ? (
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Postęp</Typography>
                        <Typography variant="caption" fontWeight={600} color="primary.main">{pct}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct}
                        sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  ) : (
                    <Chip label="Rozpocznij" size="small" variant="outlined" color="primary" />
                  )}
                </MotionPaper>
              </Grid>
            )
          })}
        </Grid>
      )}
    </MotionBox>
  )
}