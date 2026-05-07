import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { PathDetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Collapse from '@mui/material/Collapse'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  getLearningPath,
  getSections,
  getUnits,
  startLearningPath,
  getLearningPathsProgress,
} from '../api'
import type { LearningPath, Section, Unit } from '../types/api'
import SortableList from '../components/SortableList'

const MotionBox = motion.create(Box)
const MotionPaper = motion.create(Paper)

export default function LearningPathDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [path, setPath] = useState<LearningPath | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [unitsBySection, setUnitsBySection] = useState<Record<string, Unit[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<{ completedSectionCount: number; totalSectionCount: number } | null>(null)
  const [starting, setStarting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [pathData, sectionsData, unitsData] = await Promise.all([
        getLearningPath(id),
        getSections(),
        getUnits(),
      ])
      setPath(pathData.path)

      const filteredSections = sectionsData.sections
        .filter((s) => s.learningPathId === id)
        .sort((a, b) => a.order - b.order)
      setSections(filteredSections)

      const grouped: Record<string, Unit[]> = {}
      for (const section of filteredSections) {
        grouped[section.id] = unitsData.units
          .filter((u) => u.sectionId === section.id)
          .sort((a, b) => a.order - b.order)
      }
      setUnitsBySection(grouped)

      try {
        const progressRes = await getLearningPathsProgress()
        const myProgress = progressRes.learningPathProgress.find(p => p.learningPathId === id)
        setProgress(myProgress ?? null)
      } catch { /* ignore */ }

      if (filteredSections.length > 0) {
        setExpandedSections(new Set([filteredSections[0].id]))
      }
    } catch {
      setError('Nie udało się pobrać danych.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const totalUnits = Object.values(unitsBySection).reduce((sum, units) => sum + units.length, 0)

  if (loading) {
    return <PathDetailSkeleton />
  }

  if (!path) {
    return <Alert severity="error">Nie znaleziono ścieżki nauki.</Alert>
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Pulpit
          </Link>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/explore')}>
            Ścieżki
          </Link>
          <Typography color="text.primary">{path.name}</Typography>
        </Breadcrumbs>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Hero header */}
      <MotionPaper
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 50%, #00D2FF 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', top: -50, right: -20 }} />
        <Box sx={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', bottom: -30, right: 80 }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                {path.name}
              </Typography>
              {path.description && (
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: 600 }}>
                  {path.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`${sections.length} sekcji`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }} />
                <Chip label={`${totalUnits} unitów`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }} />
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Postęp</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {progress ? `${Math.round((progress.completedSectionCount / (progress.totalSectionCount || 1)) * 100)}%` : '0%'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress ? Math.round((progress.completedSectionCount / (progress.totalSectionCount || 1)) * 100) : 0}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
            />
            {!progress && (
              <Button
                variant="contained"
                size="large"
                disabled={starting}
                onClick={async () => {
                  setStarting(true)
                  try {
                    await startLearningPath(id!)
                    const progressRes = await getLearningPathsProgress()
                    const myProgress = progressRes.learningPathProgress.find(p => p.learningPathId === id)
                    setProgress(myProgress ?? null)
                  } catch { /* ignore */ } finally {
                    setStarting(false)
                  }
                }}
                sx={{
                  mt: 2,
                  bgcolor: 'white',
                  color: '#6C63FF',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                {starting ? 'Startowanie...' : '▶ Rozpocznij naukę'}
              </Button>
            )}
          </Box>
        </Box>
      </MotionPaper>

      {/* Sections roadmap */}
      <Typography variant="h5" sx={{ mb: 3 }}>Plan nauki</Typography>

      {sections.length === 0 ? (
        <MotionPaper
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          sx={{ p: 6, textAlign: 'center' }}
        >
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Brak sekcji
          </Typography>
        </MotionPaper>
      ) : (
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              top: 0,
              bottom: 0,
              width: 3,
              background: 'linear-gradient(180deg, #6C63FF 0%, #00D2FF 100%)',
              opacity: 0.3,
              borderRadius: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          />

          {sections.map((section, index) => {
            const units = unitsBySection[section.id] ?? []
            const isExpanded = expandedSections.has(section.id)

            return (
              <MotionBox
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                sx={{ position: 'relative', mb: 2 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: 20,
                    zIndex: 1,
                    width: 27,
                    height: 27,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6C63FF, #00D2FF)',
                    color: 'white',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 3px 12px rgba(108, 99, 255, 0.35)',
                  }}
                >
                  {index + 1}
                </Box>

                <Paper
                  sx={{
                    ml: { xs: 0, sm: 7 },
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateX(4px)' },
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
                    onClick={() => toggleSection(section.id)}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {section.name}
                        </Typography>
                        <Chip label={`${units.length} unitów`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                    <ExpandMoreIcon 
                      sx={{ 
                        transition: '0.3s', 
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'text.secondary'
                      }} 
                    />
                  </Box>

                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2.5, pb: 2 }}>
                      {units.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          Brak unitów w tej sekcji
                        </Typography>
                      ) : (
                        <SortableList
                          items={units}
                          onReorder={() => {}} // Dodaj tę linię, aby zaspokoić TypeScript
                          renderItem={(unit) => (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1.5,
                                px: 1.5,
                                borderRadius: 2,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover', transform: 'translateX(4px)' },
                              }}
                              onClick={() => navigate(`/units/${unit.id}`)}
                            >
                              <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', mr: 2, fontSize: 20 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {unit.name}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        />
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              </MotionBox>
            )
          })}
        </Box>
      )}
    </>
  )
}