import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useNavigate } from 'react-router-dom'
import type { LearningPath } from '../types/api'

interface LearningPathCardProps {
  learningPath: LearningPath
  onDelete: (id: string) => void
}

export default function LearningPathCard({ learningPath, onDelete }: LearningPathCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
      onClick={() => navigate(`/learning-paths/${learningPath.id}`)}
    >
      {/* Color header bar */}
      <Box
        sx={{
          height: 8,
          bgcolor: 'primary.main',
          borderRadius: '16px 16px 0 0',
        }}
      />
      <CardContent sx={{ flex: 1, pt: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
            {learningPath.name}
          </Typography>
          <Chip label="Nowa" size="small" variant="outlined" color="primary" sx={{ ml: 1, flexShrink: 0 }} />
        </Box>

        {learningPath.description && (
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}>
            {learningPath.description}
          </Typography>
        )}

        {/* Placeholder progress */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Postęp</Typography>
            <Typography variant="caption" color="text.secondary">0%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={0} sx={{ borderRadius: 4, height: 6 }} />
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {new Date(learningPath.createdAt).toLocaleDateString('pl-PL')}
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/learning-paths/${learningPath.id}/edit`)
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(learningPath.id)
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary">
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  )
}
