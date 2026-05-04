import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import GitHubIcon from '@mui/icons-material/GitHub'
import FolderIcon from '@mui/icons-material/Folder'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { apiClient } from '../api'

interface Project {
  id: string
  name: string
  description: string | null
  acceptUrl: string
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get<{ projects: Project[] }>('/v1/projects')
        setProjects(res.projects)
      } catch {
        setError('Nie udało się pobrać projektów.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Projekty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Praktyczne projekty do wykonania
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            Brak projektów
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Administrator musi dodać projekty do systemu
          </Typography>
        </Paper>
      ) : (
        projects.map((project) => (
          <Paper
            key={project.id}
            sx={{ p: 3, mb: 2, borderRadius: 3, '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <GitHubIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="h6" fontWeight={600}>
                    {project.name}
                  </Typography>
                  <Chip label="GitHub Classroom" size="small" variant="outlined" />
                </Box>
                {project.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {project.description}
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                href={project.acceptUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                Akceptuj projekt
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </>
  )
}