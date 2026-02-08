import { useState, useEffect, useCallback } from 'react'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import SearchIcon from '@mui/icons-material/Search'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { getLearningPaths } from '../api'
import type { LearningPath } from '../types/api'
import LearningPathCard from '../components/LearningPathCard'
import ConfirmDialog from '../components/ConfirmDialog'
import { deleteLearningPath } from '../api'

export default function ExplorePage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPaths = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLearningPaths()
      setPaths(data.paths)
    } catch {
      setError('Nie udało się pobrać ścieżek.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaths()
  }, [fetchPaths])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLearningPath(deleteId)
      setDeleteId(null)
      fetchPaths()
    } catch {
      setError('Nie udało się usunąć ścieżki.')
      setDeleteId(null)
    }
  }

  const filteredPaths = paths.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Przeglądaj ścieżki
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Znajdź ścieżkę nauki dopasowaną do Twoich potrzeb
      </Typography>

      <TextField
        fullWidth
        placeholder="Czego chcesz się nauczyć?"
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredPaths.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AutoStoriesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? 'Nie znaleziono ścieżek' : 'Brak dostępnych ścieżek'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Wkrótce pojawią się nowe ścieżki nauki'}
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
        message="Czy na pewno chcesz usunąć tę ścieżkę?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
