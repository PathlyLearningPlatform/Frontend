import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useLanguage } from '../context/LanguageContext'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #FF6584 0%, #FF8FA3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <WarningAmberIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.95rem' }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} sx={{ borderRadius: 2, px: 3 }}>{t('crud.cancel')}</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 14px rgba(255, 101, 132, 0.35)',
            '&:hover': { boxShadow: '0 6px 20px rgba(255, 101, 132, 0.45)' },
          }}
        >
          {t('crud.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
