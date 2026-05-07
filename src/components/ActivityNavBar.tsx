// src/components/ActivityNavBar.tsx
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ListIcon from '@mui/icons-material/List'

interface ActivityNavBarProps {
  currentIndex: number
  totalCount: number
  hasPrev: boolean
  hasNext: boolean
  isLast: boolean
  onPrev: () => void
  onNext: () => void
  onGoToLesson: () => void
  // opcjonalne: czy zablokować "Następna" dopóki nie ukończono
  requireCompletion?: boolean
  isCompleted?: boolean
}

export default function ActivityNavBar({
  currentIndex,
  totalCount,
  hasPrev,
  hasNext,
  isLast,
  onPrev,
  onNext,
  onGoToLesson,
  requireCompletion = false,
  isCompleted = false,
}: ActivityNavBarProps) {
  const nextDisabled = requireCompletion && !isCompleted

  return (
    <Box
      sx={{
        mt: 4,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {/* Lewa strona – Poprzednia lub Wróć do lekcji */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={hasPrev ? onPrev : onGoToLesson}
      >
        {hasPrev ? 'Poprzednia' : 'Wróć do lekcji'}
      </Button>

      {/* Środek – licznik */}
      {totalCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} / {totalCount}
        </Typography>
      )}

      {/* Prawa strona – Następna lub Zakończ lekcję */}
      {isLast ? (
        <Button
          variant="contained"
          color="success"
          startIcon={<DoneAllIcon />}
          onClick={onGoToLesson}
          disabled={nextDisabled}
        >
          Zakończ lekcję
        </Button>
      ) : hasNext ? (
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onNext}
          disabled={nextDisabled}
          title={nextDisabled ? 'Ukończ tę aktywność, aby przejść dalej' : undefined}
        >
          Następna
        </Button>
      ) : (
        // Fallback gdy nie ma state z LessonDetail (wejście bezpośrednio przez URL)
        <Button
          variant="outlined"
          startIcon={<ListIcon />}
          onClick={onGoToLesson}
        >
          Wróć do lekcji
        </Button>
      )}
    </Box>
  )
}