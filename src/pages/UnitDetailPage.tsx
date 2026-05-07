import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import { useParams, useNavigate } from 'react-router-dom'
import { getUnit, getSection, getLearningPath, getLessons } from '../api'
import type { Unit, Lesson, Section, LearningPath } from '../types/api'
import SortableList from '../components/SortableList'

export default function UnitDetailPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [parentSection, setParentSection] = useState<Section | null>(null)
  const [parentPath, setParentPath] = useState<LearningPath | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!unitId) return
    setLoading(true)
    setError(null)
    try {
      const [unitData, lessonsData] = await Promise.all([
        getUnit(unitId),
        getLessons(),
      ])
      setUnit(unitData.unit)
      
      try {
        const sectionData = await getSection(unitData.unit.sectionId)
        setParentSection(sectionData.section)
        const pathData = await getLearningPath(sectionData.section.learningPathId)
        setParentPath(pathData.path)
      } catch { /* breadcrumbs fallback */ }

      setLessons(
        lessonsData.lessons
          .filter((l) => l.unitId === unitId)
          .sort((a, b) => a.order - b.order)
      )
    } catch {
      setError('Nie udało się pobrać danych lekcji.')
    } finally {
      setLoading(false)
    }
  }, [unitId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) return <DetailSkeleton />
  if (!unit) return <Alert severity="error">Nie znaleziono unita.</Alert>

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        {parentPath && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/learning-paths/${parentPath.id}`)}>
            {parentPath.name}
          </Link>
        )}
        {parentSection && (
          <Typography color="inherit">
            {parentSection.name}
          </Typography>
        )}
        <Typography color="text.primary">{unit.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Unita */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <SchoolIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{unit.name}</Typography>
        </Box>
        {unit.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>{unit.description}</Typography>
        )}
        <Chip 
          label={`${lessons.length} lekcji`} 
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} 
        />
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Spis treści lekcji</Typography>
      </Box>

      {lessons.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Brak lekcji w tym module.
          </Typography>
        </Paper>
      ) : (
        <SortableList
          items={lessons}
          onReorder={() => {}} // Tylko do odczytu
          renderItem={(lesson, index) => (
            <Paper 
              sx={{ 
                mb: 2, 
                overflow: 'hidden', 
                transition: 'all 0.2s', 
                '&:hover': { 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  transform: 'translateX(4px)'
                } 
              }}
            >
              <Box
                sx={{ 
                  p: 2.5, 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  '&:hover': { bgcolor: 'action.hover' } 
                }}
                onClick={() => navigate(`/lessons/${lesson.id}`)}
              >
                <Box 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 14, 
                    fontWeight: 700, 
                    mr: 2, 
                    flexShrink: 0 
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{lesson.name}</Typography>
                  {lesson.description && (
                    <Typography variant="body2" color="text.secondary">{lesson.description}</Typography>
                  )}
                </Box>
                <Typography variant="button" color="primary" sx={{ fontWeight: 700, ml: 2 }}>
                  Otwórz lekcję
                </Typography>
              </Box>
            </Paper>
          )}
        />
      )}
    </>
  )
}