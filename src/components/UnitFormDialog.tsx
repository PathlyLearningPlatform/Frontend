import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { createUnit, updateUnit } from '../api'
import type { Unit } from '../types/api'

interface UnitFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  sectionId: string
  unit?: Unit
  nextOrder: number
}

export default function UnitFormDialog({ open, onClose, onSave, sectionId, unit, nextOrder }: UnitFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(nextOrder)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(unit?.name ?? '')
      setDescription(unit?.description ?? '')
      setOrder(unit?.order ?? nextOrder)
    }
  }, [open, unit, nextOrder])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (unit) {
        await updateUnit(unit.id, { name: name.trim(), description: description.trim() || undefined, order })
      } else {
        await createUnit({ name: name.trim(), description: description.trim() || undefined, order, sectionId })
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
      <DialogTitle>{unit ? 'Edytuj unit' : 'Nowy unit'}</DialogTitle>
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
