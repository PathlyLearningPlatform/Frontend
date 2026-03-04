import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import QuizIcon from '@mui/icons-material/Quiz'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson, getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../api'
import type { Activity, Lesson, Question } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSnackbar } from '../context/SnackbarContext'

export default function QuizDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()

  const [quiz, setQuiz] = useState<Activity | null>(null)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined)
  const [formContent, setFormContent] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    setError(null)
    try {
      const [activityData, questionsData] = await Promise.all([
        getActivity(activityId),
        getQuestions(activityId),
      ])
      setQuiz(activityData.activity)
      setQuestions(questionsData.questions.sort((a, b) => a.order - b.order))
      try {
        const lessonData = await getLesson(activityData.activity.lessonId)
        setParentLesson(lessonData.lesson)
      } catch { /* breadcrumbs fallback */ }
    } catch {
      setError('Nie udało się pobrać danych quizu.')
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openDialog = (question?: Question) => {
    setEditingQuestion(question)
    setFormContent(question?.content ?? '')
    setFormAnswer(question?.correctAnswer ?? '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!activityId || !formContent.trim() || !formAnswer.trim()) return
    setSaving(true)
    try {
      if (editingQuestion) {
        const res = await updateQuestion(activityId, editingQuestion.id, {
          content: formContent,
          correctAnswer: formAnswer,
        })
        setQuestions((prev) =>
          prev.map((q) => (q.id === res.question.id ? res.question : q))
        )
        showSnackbar('Pytanie zaktualizowane')
      } else {
        const res = await createQuestion(activityId, {
          content: formContent,
          correctAnswer: formAnswer,
        })
        setQuestions((prev) => [...prev, res.question].sort((a, b) => a.order - b.order))
        showSnackbar('Pytanie dodane')
      }
      setDialogOpen(false)
    } catch {
      setError('Nie udało się zapisać pytania.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activityId || !deleteQuestionId) return
    const removedId = deleteQuestionId
    setQuestions((prev) => prev.filter((q) => q.id !== removedId))
    setDeleteQuestionId(null)
    try {
      await deleteQuestion(activityId, removedId)
      showSnackbar('Pytanie usunięte')
    } catch {
      setError('Nie udało się usunąć pytania.')
      fetchData()
    }
  }

  if (loading) return <DetailSkeleton />
  if (!quiz) return <Alert severity="error">Nie znaleziono quizu.</Alert>

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Pulpit
        </Link>
        {parentLesson && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/lessons/${parentLesson.id}`)}>
            {parentLesson.name}
          </Link>
        )}
        <Typography color="text.primary">{quiz.name}</Typography>
      </Breadcrumbs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <QuizIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {quiz.name}
          </Typography>
          <Chip label="Quiz" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
        {quiz.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            {quiz.description}
          </Typography>
        )}
        <Chip
          label={`${questions.length} pytań`}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Pytania</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => openDialog()}>
          Dodaj pytanie
        </Button>
      </Box>

      {questions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak pytań
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Dodaj pierwsze pytanie do tego quizu
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openDialog()}>
            Dodaj pytanie
          </Button>
        </Paper>
      ) : (
        questions.map((question, index) => (
          <Paper key={question.id} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#9C27B0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  mr: 2,
                  flexShrink: 0,
                  mt: 0.5,
                }}
              >
                {index + 1}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {question.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                    {question.correctAnswer}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" onClick={() => openDialog(question)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setDeleteQuestionId(question.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))
      )}

      {/* Question dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQuestion ? 'Edytuj pytanie' : 'Nowe pytanie'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Treść pytania"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Prawidłowa odpowiedź"
            value={formAnswer}
            onChange={(e) => setFormAnswer(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formContent.trim() || !formAnswer.trim()}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteQuestionId !== null}
        title="Usuń pytanie"
        message="Czy na pewno chcesz usunąć to pytanie?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteQuestionId(null)}
      />
    </>
  )
}
