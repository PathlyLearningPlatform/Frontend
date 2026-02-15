import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { PathDetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Collapse from '@mui/material/Collapse'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getLearningPath,
  deleteLearningPath,
  getSections,
  deleteSection,
  getUnits,
  deleteUnit,
  updateUnit,
} from '../api'
import type { LearningPath, Section, Unit } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import SectionFormDialog from '../components/SectionFormDialog'
import UnitFormDialog from '../components/UnitFormDialog'
import SortableList from '../components/SortableList'
import { useSnackbar } from '../context/SnackbarContext'

export default function LearningPathDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const [path, setPath] = useState<LearningPath | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [unitsBySection, setUnitsBySection] = useState<Record<string, Unit[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Dialogs
  const [deletePathOpen, setDeletePathOpen] = useState(false)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | undefined>(undefined)
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined)
  const [unitSectionId, setUnitSectionId] = useState('')

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

      // Expand first section by default
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

  const handleDeletePath = async () => {
    if (!id) return
    try {
      await deleteLearningPath(id)
      navigate('/')
    } catch {
      setError('Nie udało się usunąć ścieżki.')
    }
    setDeletePathOpen(false)
  }

  const handleDeleteSection = async () => {
    if (!deleteSectionId) return
    // Optimistic: remove from UI immediately
    const removedId = deleteSectionId
    setSections((prev) => prev.filter((s) => s.id !== removedId))
    setUnitsBySection((prev) => {
      const next = { ...prev }
      delete next[removedId]
      return next
    })
    setDeleteSectionId(null)
    try {
      await deleteSection(removedId)
      showSnackbar('Sekcja usunięta')
    } catch {
      setError('Nie udało się usunąć sekcji.')
      fetchData() // rollback on error
    }
  }

  const handleDeleteUnit = async () => {
    if (!deleteUnitId) return
    const removedId = deleteUnitId
    setUnitsBySection((prev) => {
      const next: Record<string, Unit[]> = {}
      for (const [sectionId, units] of Object.entries(prev)) {
        next[sectionId] = units.filter((u) => u.id !== removedId)
      }
      return next
    })
    setDeleteUnitId(null)
    try {
      await deleteUnit(removedId)
      showSnackbar('Unit usunięty')
    } catch {
      setError('Nie udało się usunąć unita.')
      fetchData()
    }
  }

  const handleSectionSave = (section: Section) => {
    if (editingSection) {
      setSections((prev) =>
        prev.map((s) => (s.id === section.id ? section : s)).sort((a, b) => a.order - b.order)
      )
      showSnackbar('Sekcja zaktualizowana')
    } else {
      setSections((prev) => [...prev, section].sort((a, b) => a.order - b.order))
      setUnitsBySection((prev) => ({ ...prev, [section.id]: [] }))
      setExpandedSections((prev) => new Set([...prev, section.id]))
      showSnackbar('Sekcja dodana')
    }
  }

  const handleUnitSave = (unit: Unit) => {
    if (editingUnit) {
      setUnitsBySection((prev) => ({
        ...prev,
        [unitSectionId]: (prev[unitSectionId] ?? [])
          .map((u) => (u.id === unit.id ? unit : u))
          .sort((a, b) => a.order - b.order),
      }))
      showSnackbar('Unit zaktualizowany')
    } else {
      setUnitsBySection((prev) => ({
        ...prev,
        [unitSectionId]: [...(prev[unitSectionId] ?? []), unit].sort((a, b) => a.order - b.order),
      }))
      showSnackbar('Unit dodany')
    }
  }

  const handleReorderUnits = (sectionId: string, reordered: Unit[]) => {
    const updated = reordered.map((u, i) => ({ ...u, order: i + 1 }))
    setUnitsBySection((prev) => ({ ...prev, [sectionId]: updated }))
    updated.forEach((u) => updateUnit(u.id, { order: u.order }).catch(() => {}))
    showSnackbar('Kolejność unitów zmieniona')
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
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/explore')}>
          Ścieżki
        </Link>
        <Typography color="text.primary">{path.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Hero header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {path.name}
              </Typography>
              {path.description && (
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, maxWidth: 600 }}>
                  {path.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${sections.length} sekcji`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  label={`${totalUnits} unitów`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                onClick={() => navigate(`/learning-paths/${id}/edit`)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
                onClick={() => setDeletePathOpen(true)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Postęp</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>0%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={0}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: 'white' },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Sections roadmap */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Plan nauki</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSection(undefined)
            setSectionDialogOpen(true)
          }}
        >
          Dodaj sekcję
        </Button>
      </Box>

      {sections.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak sekcji
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Dodaj pierwszą sekcję do tej ścieżki nauki
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSection(undefined)
              setSectionDialogOpen(true)
            }}
          >
            Dodaj sekcję
          </Button>
        </Paper>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline line */}
          <Box
            sx={{
              position: 'absolute',
              left: 24,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: 'divider',
              display: { xs: 'none', sm: 'block' },
            }}
          />

          {sections.map((section, index) => {
            const units = unitsBySection[section.id] ?? []
            const isExpanded = expandedSections.has(section.id)

            return (
              <Box key={section.id} sx={{ position: 'relative', mb: 2 }}>
                {/* Timeline dot */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: 20,
                    width: 27,
                    height: 27,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    zIndex: 1,
                  }}
                >
                  {index + 1}
                </Box>

                <Paper
                  sx={{
                    ml: { xs: 0, sm: 7 },
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
                  }}
                >
                  {/* Section header */}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {section.name}
                        </Typography>
                        <Chip
                          label={`${units.length} unitów`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      </Box>
                      {section.description && (
                        <Typography variant="body2" color="text.secondary">
                          {section.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingSection(section)
                          setSectionDialogOpen(true)
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteSectionId(section.id)
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>

                  {/* Units list */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2.5, pb: 2 }}>
                      {units.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          Brak unitów w tej sekcji
                        </Typography>
                      ) : (
                        <SortableList
                          items={units}
                          onReorder={(reordered) => handleReorderUnits(section.id, reordered)}
                          renderItem={(unit) => (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1.5,
                                px: 1.5,
                                borderRadius: 2,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                transition: 'background-color 0.15s',
                              }}
                              onClick={() => navigate(`/units/${unit.id}`)}
                            >
                              <RadioButtonUncheckedIcon
                                sx={{ color: 'text.secondary', mr: 2, fontSize: 20 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {unit.name}
                                </Typography>
                                {unit.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {unit.description}
                                  </Typography>
                                )}
                              </Box>
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingUnit(unit)
                                    setUnitSectionId(section.id)
                                    setUnitDialogOpen(true)
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteUnitId(unit.id)
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        />
                      )}

                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ mt: 1, ml: 1 }}
                        onClick={() => {
                          setEditingUnit(undefined)
                          setUnitSectionId(section.id)
                          setUnitDialogOpen(true)
                        }}
                      >
                        Dodaj unit
                      </Button>
                    </Box>
                  </Collapse>
                </Paper>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={deletePathOpen}
        title="Usuń ścieżkę nauki"
        message="Czy na pewno chcesz usunąć tę ścieżkę? Ta operacja jest nieodwracalna."
        onConfirm={handleDeletePath}
        onCancel={() => setDeletePathOpen(false)}
      />
      <ConfirmDialog
        open={deleteSectionId !== null}
        title="Usuń sekcję"
        message="Czy na pewno chcesz usunąć tę sekcję?"
        onConfirm={handleDeleteSection}
        onCancel={() => setDeleteSectionId(null)}
      />
      <ConfirmDialog
        open={deleteUnitId !== null}
        title="Usuń unit"
        message="Czy na pewno chcesz usunąć ten unit?"
        onConfirm={handleDeleteUnit}
        onCancel={() => setDeleteUnitId(null)}
      />
      <SectionFormDialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        onSave={handleSectionSave}
        learningPathId={id!}
        section={editingSection}
        nextOrder={sections.length + 1}
      />
      <UnitFormDialog
        open={unitDialogOpen}
        onClose={() => setUnitDialogOpen(false)}
        onSave={handleUnitSave}
        sectionId={unitSectionId}
        unit={editingUnit}
        nextOrder={(unitsBySection[unitSectionId]?.length ?? 0) + 1}
      />
    </>
  )
}
