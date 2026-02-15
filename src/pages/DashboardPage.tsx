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
import { getLearningPaths, deleteLearningPath } from '../api'
import type { LearningPath } from '../types/api'
import LearningPathCard from '../components/LearningPathCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSnackbar } from '../context/SnackbarContext'

export default function DashboardPage() {
  const { showSnackbar } = useSnackbar()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchPaths = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLearningPaths()
      setPaths(data.paths)
    } catch {
      setError('Nie udało się pobrać ścieżek nauki. Sprawdź czy backend działa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaths()
  }, [fetchPaths])

  const handleDelete = async () => {
    if (!deleteId) return
    // Optimistic: remove from UI immediately
    const removedId = deleteId
    setPaths((prev) => prev.filter((p) => p.id !== removedId))
    setDeleteId(null)
    try {
      await deleteLearningPath(removedId)
      showSnackbar('Ścieżka usunięta')
    } catch {
      setError('Nie udało się usunąć ścieżki.')
      fetchPaths() // rollback on error
    }
  }

  const filteredPaths = paths.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Welcome header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Witaj w Pathly
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Odkrywaj ścieżki nauki i rozwijaj swoje umiejętności
        </Typography>
      </Box>

      {/* Search bar */}
      <TextField
        fullWidth
        placeholder="Szukaj ścieżki nauki..."
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
            bgcolor: 'background.paper',
            borderRadius: 3,
            fontSize: '1.1rem',
          },
        }}
      />

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#EDE7F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoStoriesIcon sx={{ color: '#6C63FF' }} />
            </Box>
            <Box>
              <Typography variant="h5">{paths.length}</Typography>
              <Typography variant="body2" color="text.secondary">Dostępne ścieżki</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon sx={{ color: '#4CAF50' }} />
            </Box>
            <Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">W trakcie nauki</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEventsIcon sx={{ color: '#FF9800' }} />
            </Box>
            <Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="body2" color="text.secondary">Ukończone</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Paths section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h5">Wszystkie ścieżki</Typography>
        <Chip label={filteredPaths.length} size="small" color="primary" />
      </Box>

      {loading ? (
        <DashboardSkeleton />
      ) : filteredPaths.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AutoStoriesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? 'Nie znaleziono ścieżek' : 'Brak ścieżek nauki'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Utwórz pierwszą ścieżkę, aby zacząć'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPaths.map((path) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={path.id}>
              <LearningPathCard learningPath={path} onDelete={setDeleteId} />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Usuń ścieżkę nauki"
        message="Czy na pewno chcesz usunąć tę ścieżkę? Ta operacja jest nieodwracalna."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
