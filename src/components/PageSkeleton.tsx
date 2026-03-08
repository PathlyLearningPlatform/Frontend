import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

function GlassSkeleton({
  width,
  height,
  borderRadius = 12,
  sx = {},
}: {
  width?: string | number
  height: string | number
  borderRadius?: number
  sx?: Record<string, unknown>
}) {
  return (
    <MotionBox
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      sx={{
        width: width ?? '100%',
        height,
        borderRadius: `${borderRadius}px`,
        background: (theme: { palette: { mode: string } }) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(108, 99, 255, 0.08) 0%, rgba(0, 210, 255, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(108, 99, 255, 0.06) 0%, rgba(0, 210, 255, 0.03) 100%)',
        backdropFilter: 'blur(8px)',
        border: (theme: { palette: { mode: string } }) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.06)'
            : '1px solid rgba(255, 255, 255, 0.4)',
        ...sx,
      }}
    />
  )
}

function GlassCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Gradient header */}
        <MotionBox
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
          sx={{
            height: 80,
            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(0, 210, 255, 0.1))',
            borderRadius: '20px 20px 0 0',
          }}
        />
        <Box sx={{ p: 2.5 }}>
          <GlassSkeleton height={20} width="70%" sx={{ mb: 1.5 }} />
          <GlassSkeleton height={14} width="90%" sx={{ mb: 0.8 }} />
          <GlassSkeleton height={14} width="60%" sx={{ mb: 2 }} />
          <GlassSkeleton height={6} borderRadius={4} />
        </Box>
        <Box sx={{ px: 2.5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <GlassSkeleton height={14} width={80} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <GlassSkeleton width={28} height={28} borderRadius={14} />
            <GlassSkeleton width={28} height={28} borderRadius={14} />
            <GlassSkeleton width={28} height={28} borderRadius={14} />
          </Box>
        </Box>
      </Paper>
    </MotionBox>
  )
}

export function DashboardSkeleton() {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome header skeleton */}
      <Box sx={{ mb: 4 }}>
        <GlassSkeleton height={40} width={280} sx={{ mb: 1.5 }} borderRadius={16} />
        <GlassSkeleton height={20} width={400} borderRadius={10} />
      </Box>

      {/* Search bar skeleton */}
      <GlassSkeleton height={56} sx={{ mb: 4 }} borderRadius={12} />

      {/* Stats skeleton */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[0, 1, 2].map((i) => (
          <Grid size={{ xs: 12, sm: 4 }} key={i}>
            <MotionBox
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <GlassSkeleton width={52} height={52} borderRadius={12} />
                <Box>
                  <GlassSkeleton height={28} width={50} sx={{ mb: 0.5 }} />
                  <GlassSkeleton height={14} width={90} />
                </Box>
              </Paper>
            </MotionBox>
          </Grid>
        ))}
      </Grid>

      {/* Section title skeleton */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <GlassSkeleton height={28} width={180} borderRadius={10} />
        <GlassSkeleton height={22} width={32} borderRadius={11} />
      </Box>

      {/* Card grid skeleton */}
      <Grid container spacing={3}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <GlassCardSkeleton delay={i * 0.08} />
          </Grid>
        ))}
      </Grid>
    </MotionBox>
  )
}

export function DetailSkeleton() {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <GlassSkeleton height={24} width={300} sx={{ mb: 3 }} borderRadius={8} />
      <GlassSkeleton height={200} sx={{ mb: 4 }} borderRadius={20} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <GlassSkeleton height={32} width={150} borderRadius={10} />
        <GlassSkeleton height={36} width={140} borderRadius={10} />
      </Box>
      {[0, 1, 2].map((i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
        >
          <Paper sx={{ mb: 2, p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GlassSkeleton width={36} height={36} borderRadius={18} />
              <Box sx={{ flex: 1 }}>
                <GlassSkeleton height={20} width="60%" sx={{ mb: 0.5 }} />
                <GlassSkeleton height={16} width="40%" />
              </Box>
            </Box>
          </Paper>
        </MotionBox>
      ))}
    </MotionBox>
  )
}

export function PathDetailSkeleton() {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Breadcrumbs */}
      <GlassSkeleton height={20} width={300} sx={{ mb: 3 }} borderRadius={8} />

      {/* Hero header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassSkeleton height={220} sx={{ mb: 4 }} borderRadius={20} />
      </MotionBox>

      {/* Section title + button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <GlassSkeleton height={32} width={150} borderRadius={10} />
        <GlassSkeleton height={36} width={140} borderRadius={10} />
      </Box>

      {/* Section cards */}
      {[0, 1, 2].map((i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          sx={{ position: 'relative', mb: 2, ml: { xs: 0, sm: 7 } }}
        >
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GlassSkeleton height={24} width="50%" borderRadius={8} />
                <GlassSkeleton height={22} width={70} borderRadius={8} />
              </Box>
              <GlassSkeleton height={16} width="70%" />
            </Box>
            <Box sx={{ px: 2.5, pb: 2 }}>
              {[0, 1].map((j) => (
                <Box key={j} sx={{ display: 'flex', alignItems: 'center', py: 1.5, px: 1.5 }}>
                  <GlassSkeleton width={20} height={20} borderRadius={10} sx={{ mr: 2 }} />
                  <GlassSkeleton height={16} width="45%" />
                </Box>
              ))}
            </Box>
          </Paper>
        </MotionBox>
      ))}
    </MotionBox>
  )
}
