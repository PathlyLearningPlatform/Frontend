import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import type { Activity, ActivityType, ExerciseDifficulty } from '../types/api'
import { createArticle, updateArticle, createExercise, updateExercise, createQuiz, updateQuiz } from '../api'

interface ActivityFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (activity: Activity) => void
  lessonId: string
  activity?: Activity
  nextOrder: number
}

export default function ActivityFormDialog({ open, onClose, onSave, lessonId, activity, nextOrder }: ActivityFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(nextOrder)
  const [type, setType] = useState<ActivityType>('article')
  const [ref, setRef] = useState('')
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('easy')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(activity)

  useEffect(() => {
    if (open) {
      setName(activity?.name ?? '')
      setDescription(activity?.description ?? '')
      setOrder(activity?.order ?? nextOrder)
      setType(activity?.type ?? 'article')
      setRef(activity && 'ref' in activity ? (activity as unknown as { ref: string }).ref : '')
      setDifficulty(activity && 'difficulty' in activity ? (activity as unknown as { difficulty: ExerciseDifficulty }).difficulty : 'easy')
    }
  }, [open, activity, nextOrder])

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      let result: Activity
      if (type === 'article') {
        if (isEdit && activity) {
          const data = await updateArticle(activity.id, { name: name.trim(), description: description.trim() || undefined, order, ref: ref.trim() || undefined })
          result = { ...data.article, type: 'article' }
        } else {
          const data = await createArticle({ name: name.trim(), description: description.trim() || undefined, order, lessonId, ref: ref.trim() })
          result = { ...data.article, type: 'article' }
        }
      } else if (type === 'exercise') {
        if (isEdit && activity) {
          const data = await updateExercise(activity.id, { name: name.trim(), description: description.trim() || undefined, order, difficulty })
          result = { ...data.exercise, type: 'exercise' }
        } else {
          const data = await createExercise({ name: name.trim(), description: description.trim() || undefined, order, lessonId, difficulty })
          result = { ...data.exercise, type: 'exercise' }
        }
      } else {
        if (isEdit && activity) {
          const data = await updateQuiz(activity.id, { name: name.trim(), description: description.trim() || undefined, order })
          result = { ...data.quiz, type: 'quiz' }
        } else {
          const data = await createQuiz({ name: name.trim(), description: description.trim() || undefined, order, lessonId })
          result = { ...data.quiz, type: 'quiz' }
        }
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
      <DialogTitle>{isEdit ? 'Edytuj aktywność' : 'Nowa aktywność'}</DialogTitle>
      <DialogContent>
        <TextField
          select
          margin="dense"
          label="Typ"
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
          disabled={isEdit}
        >
          <MenuItem value="article">Artykuł</MenuItem>
          <MenuItem value="exercise">Ćwiczenie</MenuItem>
          <MenuItem value="quiz">Quiz</MenuItem>
        </TextField>
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
        {type === 'article' && (
          <TextField
            margin="dense"
            label="Link do artykułu"
            fullWidth
            required
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="https://..."
          />
        )}
        {type === 'exercise' && (
          <TextField
            select
            margin="dense"
            label="Poziom trudności"
            fullWidth
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
          >
            <MenuItem value="easy">Łatwy</MenuItem>
            <MenuItem value="medium">Średni</MenuItem>
            <MenuItem value="hard">Trudny</MenuItem>
          </TextField>
        )}
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
