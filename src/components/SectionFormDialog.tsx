import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { createSection, updateSection } from '../api'
import type { Section } from '../types/api'

interface SectionFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  learningPathId: string
  section?: Section
  nextOrder: number
}

export default function SectionFormDialog({ open, onClose, onSave, learningPathId, section, nextOrder }: SectionFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(nextOrder)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(section?.name ?? '')
      setDescription(section?.description ?? '')
      setOrder(section?.order ?? nextOrder)
    }
  }, [open, section, nextOrder])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (section) {
        await updateSection(section.id, { name: name.trim(), description: description.trim() || undefined, order })
      } else {
        await createSection({ name: name.trim(), description: description.trim() || undefined, order, learningPathId })
      }
      onSave()
      onClose()
    } catch {
      // TODO: show error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{section ? 'Edytuj sekcję' : 'Nowa sekcja'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nazwa"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Opis"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Kolejność"
          type="number"
          fullWidth
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving || !name.trim()}>
          {saving ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
