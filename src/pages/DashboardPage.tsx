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
import SearchIcon from '@mui/icons-material/Search'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import { motion } from 'framer-motion'
import { getLearningPaths, deleteLearningPath } from '../api'
import type { LearningPath } from '../types/api'
import LearningPathCard from '../components/LearningPathCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSnackbar } from '../context/SnackbarContext'
import { useLanguage } from '../context/LanguageContext'

const MotionBox = motion.create(Box)
const MotionPaper = motion.create(Paper)

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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
  const { showSnackbar } = useSnackbar()
  const { t } = useLanguage()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const statCards = [
    {
      icon: <AutoStoriesIcon />,
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
      shadowColor: 'rgba(108, 99, 255, 0.3)',
      label: t('dashboard.available'),
      key: 'total' as const,
    },
    {
      icon: <TrendingUpIcon />,
      gradient: 'linear-gradient(135deg, #36D399 0%, #22B573 100%)',
      shadowColor: 'rgba(54, 211, 153, 0.3)',
      label: t('dashboard.inProgress'),
      key: 'progress' as const,
    },
    {
      icon: <EmojiEventsIcon />,
      gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
      shadowColor: 'rgba(255, 152, 0, 0.3)',
      label: t('dashboard.completed'),
      key: 'done' as const,
    },
  ]

  const fetchPaths = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLearningPaths()
      setPaths(data.paths)
    } catch {
      setError(t('dashboard.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPaths()
  }, [fetchPaths])

  const handleDelete = async () => {
    if (!deleteId) return
    const removedId = deleteId
    setPaths((prev) => prev.filter((p) => p.id !== removedId))
    setDeleteId(null)
    try {
      await deleteLearningPath(removedId)
      showSnackbar(t('dashboard.pathDeleted'))
    } catch {
      setError(t('dashboard.deleteError'))
      fetchPaths()
    }
  }

  const filteredPaths = paths.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const statValues = {
    total: paths.length,
    progress: 0,
    done: 0,
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome header */}
      <MotionBox
        variants={itemVariants}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 5,
          position: 'relative',
          overflow: 'hidden',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,210,255,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,210,255,0.04) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)'
            : 'inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 32px rgba(108,99,255,0.08)',
          // Subtle glow behind header
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: '20%',
            width: '60%',
            height: 60,
            background: 'linear-gradient(90deg, rgba(108,99,255,0.2), rgba(0,210,255,0.15))',
            filter: 'blur(25px)',
            borderRadius: '50%',
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
            top: -60,
            right: -30,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,210,255,0.12) 0%, transparent 70%)',
            bottom: -40,
            right: 100,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D2FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('dashboard.welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {t('dashboard.subtitle')}
          </Typography>
        </Box>
      </MotionBox>

      {/* Search bar */}
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
            mb: 4,
            '& .MuiOutlinedInput-root': {
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(18, 18, 35, 0.4)'
                : 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(16px)',
              borderRadius: 3,
              fontSize: '1.05rem',
              transition: 'all 0.3s',
              border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
              '&:hover': {
                boxShadow: '0 4px 20px rgba(108, 99, 255, 0.15)',
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(18, 18, 35, 0.55)'
                  : 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        />
      </MotionBox>

      {/* Stats cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.key}>
            <MotionPaper
              variants={itemVariants}
              whileHover={{
                y: -6,
                scale: 1.03,
                transition: { duration: 0.25, ease: 'easeOut' },
              }}
              whileTap={{ scale: 0.97 }}
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                cursor: 'default',
                '&:hover': {
                  boxShadow: `0 16px 40px ${stat.shadowColor}`,
                },
              }}
            >
              <motion.div
                whileHover={{ rotate: -8, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    background: stat.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${stat.shadowColor}`,
                    color: 'white',
                  }}
                >
                  {stat.icon}
                </Box>
              </motion.div>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>
                  {statValues[stat.key]}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Box>
            </MotionPaper>
          </Grid>
        ))}
      </Grid>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Paths section */}
      <MotionBox variants={itemVariants} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('dashboard.allPaths')}</Typography>
        <Chip
          label={filteredPaths.length}
          size="small"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6C63FF, #9590FF)',
            color: 'white',
          }}
        />
      </MotionBox>

      {loading ? (
        <DashboardSkeleton />
      ) : filteredPaths.length === 0 ? (
        <MotionPaper
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          sx={{ p: 6, textAlign: 'center' }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,210,255,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AutoStoriesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={700}>
            {search ? t('dashboard.noPathsFound') : t('dashboard.noPaths')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? t('dashboard.changeSearch') : t('dashboard.createFirst')}
          </Typography>
        </MotionPaper>
      ) : (
        <Grid container spacing={3}>
          {filteredPaths.map((path, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={path.id}
            >
              <LearningPathCard learningPath={path} onDelete={setDeleteId} index={index} />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={t('delete.path')}
        message={t('delete.pathMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </MotionBox>
  )
}
