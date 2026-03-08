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
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LearningPath } from '../types/api'

interface LearningPathCardProps {
  learningPath: LearningPath
  onDelete: (id: string) => void
  index?: number
}

const cardGradients = [
  { css: 'linear-gradient(135deg, #6C63FF 0%, #9590FF 100%)', glow: 'rgba(108, 99, 255, 0.25)' },
  { css: 'linear-gradient(135deg, #FF6584 0%, #FF8FA3 100%)', glow: 'rgba(255, 101, 132, 0.25)' },
  { css: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)', glow: 'rgba(0, 210, 255, 0.25)' },
  { css: 'linear-gradient(135deg, #36D399 0%, #22B573 100%)', glow: 'rgba(54, 211, 153, 0.25)' },
  { css: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)', glow: 'rgba(255, 152, 0, 0.25)' },
  { css: 'linear-gradient(135deg, #E040FB 0%, #AB47BC 100%)', glow: 'rgba(224, 64, 251, 0.25)' },
]

function getGradientInfo(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return cardGradients[Math.abs(hash) % cardGradients.length]
}

const MotionCard = motion.create(Card)

export default function LearningPathCard({ learningPath, onDelete, index = 0 }: LearningPathCardProps) {
  const navigate = useNavigate()
  const gradientInfo = getGradientInfo(learningPath.id)

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        // Colored glow behind the card
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '10%',
          borderRadius: '50%',
          background: gradientInfo.glow,
          filter: 'blur(30px)',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          zIndex: 0,
        },
        '&:hover::before': {
          opacity: 1,
        },
      }}
    >
      <MotionCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
          ease: [0.16, 1, 0.3, 1] as const,
        }}
        whileHover={{
          y: -8,
          scale: 1.02,
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        whileTap={{ scale: 0.98 }}
        sx={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          '&:hover': {
            '& .card-gradient-header': {
              height: 90,
            },
            '& .card-icon': {
              transform: 'scale(1.15) rotate(-8deg)',
            },
          },
        }}
        onClick={() => navigate(`/learning-paths/${learningPath.id}`)}
      >
        {/* Gradient header */}
        <Box
          className="card-gradient-header"
          sx={{
            height: 80,
            background: gradientInfo.css,
            borderRadius: '20px 20px 0 0',
            position: 'relative',
            overflow: 'hidden',
            transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              top: -20,
              right: -10,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              bottom: -10,
              right: 30,
            }}
          />
          <Box
            className="card-icon"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <AutoStoriesIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
        </Box>

        <CardContent sx={{ flex: 1, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', lineHeight: 1.3, fontWeight: 700 }}>
              {learningPath.name}
            </Typography>
            <Chip
              label="Nowa"
              size="small"
              sx={{
                ml: 1,
                flexShrink: 0,
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                background: 'linear-gradient(135deg, #6C63FF, #9590FF)',
                color: 'white',
              }}
            />
          </Box>

          {learningPath.description && (
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2,
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}>
              {learningPath.description}
            </Typography>
          )}

          {/* Progress */}
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>Postęp</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>0%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={0}
              sx={{
                borderRadius: 4,
                height: 6,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(108, 99, 255, 0.15)' : 'rgba(108, 99, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: gradientInfo.css,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 1.5, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {new Date(learningPath.createdAt).toLocaleDateString('pl-PL')}
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/learning-paths/${learningPath.id}/edit`)
              }}
              sx={{
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'primary.main', color: 'white', transform: 'scale(1.15)' },
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
              sx={{
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'error.main', color: 'white', transform: 'scale(1.15)' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: 'primary.main',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(4px)' },
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </MotionCard>
    </Box>
  )
}
