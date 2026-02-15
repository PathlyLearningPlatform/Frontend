import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { createLesson, updateLesson } from '../api'
import type { Lesson } from '../types/api'

interface LessonFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (lesson: Lesson) => void
  unitId: string
  lesson?: Lesson
  nextOrder: number
}

export default function LessonFormDialog({ open, onClose, onSave, unitId, lesson, nextOrder }: LessonFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(nextOrder)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(lesson?.name ?? '')
      setDescription(lesson?.description ?? '')
      setOrder(lesson?.order ?? nextOrder)
    }
  }, [open, lesson, nextOrder])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      let result: Lesson
      if (lesson) {
        const data = await updateLesson(lesson.id, { name: name.trim(), description: description.trim() || undefined, order })
        result = data.lesson
      } else {
        const data = await createLesson({ name: name.trim(), description: description.trim() || undefined, order, unitId })
        result = data.lesson
      }
      onSave(result)
      onClose()
    } catch {
      // TODO: show error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{lesson ? 'Edytuj lekcję' : 'Nowa lekcja'}</DialogTitle>
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
