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
import { useLanguage } from '../context/LanguageContext'
import { useSnackbar } from '../context/SnackbarContext'

interface ActivityFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (activity: Activity) => void
  lessonId: string
  activity?: Activity
  nextOrder: number
}

export default function ActivityFormDialog({ open, onClose, onSave, lessonId, activity, nextOrder }: ActivityFormDialogProps) {
  const { t } = useLanguage()
  const { showSnackbar } = useSnackbar()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState(nextOrder)
  const [type, setType] = useState<ActivityType>('ARTICLE')
  const [ref, setRef] = useState('')
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('easy')
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(activity)

  useEffect(() => {
    if (open) {
      setName(activity?.name ?? '')
      setDescription(activity?.description ?? '')
      setOrder(activity?.order ?? nextOrder)
      setType(activity?.type ?? 'ARTICLE')
      setRef(activity && 'ref' in activity ? (activity as unknown as { ref: string }).ref : '')
      setDifficulty(activity && 'difficulty' in activity ? (activity as unknown as { difficulty: ExerciseDifficulty }).difficulty : 'easy')
    }
  }, [open, activity, nextOrder])

const handleSubmit = async () => {
  if (!name.trim()) return
  setSaving(true)
  try {
    let result: Activity
    if (type === 'ARTICLE') {
      if (isEdit && activity) {
        const data = await updateArticle(activity.id, { name: name.trim(), description: description.trim() || undefined, ref: ref.trim() || undefined })
        result = { ...data.article, type: 'ARTICLE' }
      } else {
        const data = await createArticle({ name: name.trim(), description: description.trim() || undefined, lessonId, ref: ref.trim() })
        result = { ...data.article, type: 'ARTICLE' }
      }
    } else if (type === 'EXERCISE') {
      if (isEdit && activity) {
        const data = await updateExercise(activity.id, { name: name.trim(), description: description.trim() || undefined, difficulty })
        result = { ...data.exercise, type: 'EXERCISE' }
      } else {
        const data = await createExercise({ name: name.trim(), description: description.trim() || undefined, lessonId, difficulty })
        result = { ...data.exercise, type: 'EXERCISE' }
      }
    } else {
      if (isEdit && activity) {
        const data = await updateQuiz(activity.id, { name: name.trim(), description: description.trim() || undefined })
        result = { ...data.quiz, type: 'QUIZ' }
      } else {
        const data = await createQuiz({ name: name.trim(), description: description.trim() || undefined, lessonId })
        result = { ...data.quiz, type: 'QUIZ' }
      }
    }
    onSave(result)
    onClose()
  } catch {
    showSnackbar(t('activity.saveError'), 'error')
  } finally {
    setSaving(false)
  }
}

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? t('activity.editActivity') : t('activity.newActivity')}</DialogTitle>
      <DialogContent>
        <TextField
          select
          margin="dense"
          label={t('activity.type')}
          fullWidth
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
          disabled={isEdit}
        >
          <MenuItem value="ARTICLE">{t('activity.article')}</MenuItem>
          <MenuItem value="EXERCISE">{t('activity.exercise')}</MenuItem>
          <MenuItem value="QUIZ">{t('activity.quiz')}</MenuItem>
        </TextField>
        <TextField
          autoFocus
          margin="dense"
          label={t('crud.name')}
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('crud.description')}
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('crud.order')}
          type="number"
          fullWidth
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />
        {type === 'ARTICLE' && (
          <TextField
            margin="dense"
            label={t('activity.articleLink')}
            fullWidth
            required
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="https://..."
          />
        )}
        {type === 'EXERCISE' && (
          <TextField
            select
            margin="dense"
            label={t('activity.difficulty')}
            fullWidth
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
          >
            <MenuItem value="easy">{t('activity.easy')}</MenuItem>
            <MenuItem value="medium">{t('activity.medium')}</MenuItem>
            <MenuItem value="hard">{t('activity.hard')}</MenuItem>
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('crud.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving || !name.trim() || (type === 'ARTICLE' && !ref.trim())}>
          {saving ? t('crud.saving') : t('crud.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
