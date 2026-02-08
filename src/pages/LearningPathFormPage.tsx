import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import RouteIcon from '@mui/icons-material/Route'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate, useParams } from 'react-router-dom'
import { createLearningPath, updateLearningPath, getLearningPath } from '../api'

export default function LearningPathFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setFetching(true)
      getLearningPath(id)
        .then((data) => {
          setName(data.path.name)
          setDescription(data.path.description ?? '')
        })
        .catch(() => setError('Nie udało się pobrać ścieżki.'))
        .finally(() => setFetching(false))
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      if (isEdit && id) {
        await updateLearningPath(id, { name: name.trim(), description: description.trim() || undefined })
        navigate(`/learning-paths/${id}`)
      } else {
        await createLearningPath({ name: name.trim(), description: description.trim() || undefined })
        navigate('/')
      }
    } catch {
      setError('Nie udało się zapisać ścieżki.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edytuj ścieżkę' : 'Nowa ścieżka'}</Typography>
      </Breadcrumbs>

      <Box sx={{ maxWidth: 640 }}>
        <Paper sx={{ overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RouteIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isEdit ? 'Edytuj ścieżkę nauki' : 'Utwórz nową ścieżkę nauki'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {isEdit ? 'Zaktualizuj informacje o ścieżce' : 'Wypełnij poniższe pola, aby rozpocząć'}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Nazwa ścieżki *
            </Typography>
            <TextField
              autoFocus
              placeholder="np. Podstawy programowania w Python"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Opis
            </Typography>
            <TextField
              placeholder="Opisz czego użytkownik nauczy się na tej ścieżce..."
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Utwórz ścieżkę'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  )
}
