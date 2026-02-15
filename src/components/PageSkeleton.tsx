import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'

export function DashboardSkeleton() {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" width={350} height={24} />
      </Box>
      <Skeleton variant="rounded" height={56} sx={{ mb: 4, borderRadius: 3 }} />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[0, 1, 2].map((i) => (
          <Grid size={{ xs: 12, sm: 4 }} key={i}>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export function DetailSkeleton() {
  return (
    <>
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={200} sx={{ mb: 4, borderRadius: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant="text" width={150} height={32} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Box>
      {[0, 1, 2].map((i) => (
        <Paper key={i} sx={{ mb: 2, p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
        </Paper>
      ))}
    </>
  )
}

export function PathDetailSkeleton() {
  return (
    <>
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={220} sx={{ mb: 4, borderRadius: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant="text" width={150} height={32} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Box>
      {[0, 1, 2].map((i) => (
        <Box key={i} sx={{ position: 'relative', mb: 2, ml: { xs: 0, sm: 7 } }}>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Skeleton variant="text" width="50%" height={28} />
                <Skeleton variant="rounded" width={70} height={22} />
              </Box>
              <Skeleton variant="text" width="70%" height={20} />
            </Box>
            <Box sx={{ px: 2.5, pb: 2 }}>
              {[0, 1].map((j) => (
                <Box key={j} sx={{ display: 'flex', alignItems: 'center', py: 1.5, px: 1.5 }}>
                  <Skeleton variant="circular" width={20} height={20} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="45%" height={20} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      ))}
    </>
  )
}
