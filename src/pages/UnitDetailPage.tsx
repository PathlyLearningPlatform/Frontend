import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
// import Button from '@mui/material/Button' // przywróć wraz z przyciskami „Dodaj lekcję”
import IconButton from '@mui/material/IconButton'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
// import AddIcon from '@mui/icons-material/Add' // przywróć wraz z przyciskami „Dodaj lekcję”
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import { useParams, useNavigate } from 'react-router-dom'
import { getUnit, getSection, getLearningPath, getLessons, deleteLesson, updateLesson } from '../api'
import type { Unit, Lesson, Section, LearningPath } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import LessonFormDialog from '../components/LessonFormDialog'
import SortableList from '../components/SortableList'
import { useSnackbar } from '../context/SnackbarContext'

export default function UnitDetailPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const [unit, setUnit] = useState<Unit | null>(null)
  const [parentSection, setParentSection] = useState<Section | null>(null)
  const [parentPath, setParentPath] = useState<LearningPath | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined)

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
      // Fetch parent section and path for breadcrumbs
      try {
        const sectionData = await getSection(unitData.unit.sectionId)
        setParentSection(sectionData.section)
        const pathData = await getLearningPath(sectionData.section.learningPathId)
        setParentPath(pathData.path)
      } catch { /* breadcrumbs will fallback */ }
      setLessons(
        lessonsData.lessons
          .filter((l) => l.unitId === unitId)
          .sort((a, b) => a.order - b.order)
      )
    } catch {
      setError('Nie udało się pobrać danych.')
    } finally {
      setLoading(false)
    }
  }, [unitId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return
    const removedId = deleteLessonId
    setLessons((prev) => prev.filter((l) => l.id !== removedId))
    setDeleteLessonId(null)
    try {
      await deleteLesson(removedId)
      showSnackbar('Lekcja usunięta')
    } catch {
      setError('Nie udało się usunąć lekcji.')
      fetchData()
    }
  }

  const handleLessonSave = (lesson: Lesson) => {
    if (editingLesson) {
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? lesson : l)).sort((a, b) => a.order - b.order)
      )
      showSnackbar('Lekcja zaktualizowana')
    } else {
      setLessons((prev) => [...prev, lesson].sort((a, b) => a.order - b.order))
      showSnackbar('Lekcja dodana')
    }
  }

  const handleReorderLessons = (reordered: Lesson[]) => {
    const updated = reordered.map((l, i) => ({ ...l, order: i + 1 }))
    setLessons(updated)
    updated.forEach((l) => updateLesson(l.id, { order: l.order }).catch(() => {}))
    showSnackbar('Kolejność lekcji zmieniona')
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (!unit) {
    return <Alert severity="error">Nie znaleziono unita.</Alert>
  }

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
          <Typography color="text.secondary">{parentSection.name}</Typography>
        )}
        <Typography color="text.primary">{unit.name}</Typography>
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
          background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <SchoolIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {unit.name}
          </Typography>
        </Box>
        {unit.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {unit.description}
          </Typography>
        )}
        <Chip
          label={`${lessons.length} lekcji`}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Paper>

      {/* Lessons list */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Lekcje</Typography>
        {/* Tymczasowo ukryte — tworzenie nowej lekcji z UI
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingLesson(undefined)
            setLessonDialogOpen(true)
          }}
        >
          Dodaj lekcję
        </Button>
        */}
      </Box>

      {lessons.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak lekcji
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Brak lekcji w tym unicie.
          </Typography>
          {/* Tymczasowo ukryte — tworzenie nowej lekcji z UI
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Dodaj pierwszą lekcję do tego unita
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingLesson(undefined)
              setLessonDialogOpen(true)
            }}
          >
            Dodaj lekcję
          </Button>
          */}
        </Paper>
      ) : (
        <SortableList
          items={lessons}
          onReorder={handleReorderLessons}
          renderItem={(lesson, index) => (
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
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {lesson.name}
                  </Typography>
                  {lesson.description && (
                    <Typography variant="body2" color="text.secondary">
                      {lesson.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingLesson(lesson)
                      setLessonDialogOpen(true)
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteLessonId(lesson.id)
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          )}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={deleteLessonId !== null}
        title="Usuń lekcję"
        message="Czy na pewno chcesz usunąć tę lekcję?"
        onConfirm={handleDeleteLesson}
        onCancel={() => setDeleteLessonId(null)}
      />
      <LessonFormDialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        onSave={handleLessonSave}
        unitId={unitId!}
        lesson={editingLesson}
        nextOrder={lessons.length + 1}
      />
    </>
  )
}
