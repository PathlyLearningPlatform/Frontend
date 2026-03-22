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
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import LinearProgress from '@mui/material/LinearProgress'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import QuizIcon from '@mui/icons-material/Quiz'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson, getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../api'
import type { Activity, Lesson, Question } from '../types/api'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSnackbar } from '../context/SnackbarContext'
import { useLanguage } from '../context/LanguageContext'
import { answersMatch, markActivityCompleted } from '../lib/activityProgress'

export default function QuizDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const { t } = useLanguage()

  const [quiz, setQuiz] = useState<Activity | null>(null)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [mainTab, setMainTab] = useState(0)

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined)
  const [formContent, setFormContent] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [saving, setSaving] = useState(false)

  // Tryb rozwiązywania
  const [solveIndex, setSolveIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [solveFinished, setSolveFinished] = useState(false)

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
      } catch {
        /* breadcrumbs fallback */
      }
    } catch {
      setError('Nie udało się pobrać danych quizu.')
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetSolveMode = () => {
    setSolveIndex(0)
    setUserAnswer('')
    setChecked(false)
    setLastCorrect(null)
    setCorrectCount(0)
    setSolveFinished(false)
  }

  useEffect(() => {
    resetSolveMode()
  }, [activityId])

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
        setQuestions((prev) => prev.map((q) => (q.id === res.question.id ? res.question : q)))
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

  const currentQuestion = questions[solveIndex]
  const solveProgress = questions.length > 0 ? ((solveIndex + (checked ? 1 : 0)) / questions.length) * 100 : 0

  const handleCheckAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return
    const ok = answersMatch(userAnswer, currentQuestion.correctAnswer)
    setLastCorrect(ok)
    setChecked(true)
    if (ok) setCorrectCount((c) => c + 1)
  }

  const handleNextQuestion = () => {
    if (solveIndex >= questions.length - 1) {
      setSolveFinished(true)
      if (quiz) {
        markActivityCompleted(quiz.lessonId, quiz.id)
        showSnackbar(t('quiz.markedComplete'))
      }
      return
    }
    setSolveIndex((i) => i + 1)
    setUserAnswer('')
    setChecked(false)
    setLastCorrect(null)
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
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/lessons/${parentLesson.id}`)}
          >
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
          mb: 2,
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
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 720 }}>
            {quiz.description}
          </Typography>
        )}
        <Chip
          label={t('quiz.questionCount', { count: questions.length })}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Paper>

      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ mb: 3 }} variant="fullWidth">
        <Tab label={t('quiz.tabSolve')} />
        <Tab label={t('quiz.tabManage')} />
      </Tabs>

      {mainTab === 0 && (
        <Box>
          {questions.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('quiz.noQuestionsSolve')}</Typography>
            </Paper>
          ) : solveFinished ? (
            <Paper sx={{ p: 4, maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {t('quiz.summaryTitle')}
              </Typography>
              <Typography variant="h4" sx={{ my: 2, fontWeight: 800, color: 'primary.main' }}>
                {correctCount} / {questions.length}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {t('quiz.summaryHint')}
              </Typography>
              <Button variant="contained" size="large" onClick={resetSolveMode}>
                {t('quiz.restart')}
              </Button>
            </Paper>
          ) : (
            <Paper
              elevation={3}
              sx={{
                p: { xs: 3, sm: 5 },
                maxWidth: 800,
                mx: 'auto',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    {t('quiz.questionProgress', { current: solveIndex + 1, total: questions.length })}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${Math.round(((solveIndex + (checked ? 1 : 0)) / questions.length) * 100)}%`}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
                <LinearProgress variant="determinate" value={solveProgress} sx={{ height: 10, borderRadius: 1 }} />
              </Box>

              <Typography
                component="h2"
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.4,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {currentQuestion?.content}
              </Typography>

              <TextField
                fullWidth
                label={t('quiz.yourAnswer')}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={checked}
                multiline
                minRows={2}
                sx={{ mb: 2 }}
                placeholder={t('quiz.answerPlaceholder')}
              />

              {!checked ? (
                <Button variant="contained" size="large" onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>
                  {t('quiz.check')}
                </Button>
              ) : (
                <Box>
                  <Alert
                    severity={lastCorrect ? 'success' : 'error'}
                    icon={lastCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                    sx={{ mb: 2 }}
                  >
                    <Typography fontWeight={700}>{lastCorrect ? t('quiz.correct') : t('quiz.incorrect')}</Typography>
                    {!lastCorrect && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {t('quiz.expectedAnswer')}: <strong>{currentQuestion?.correctAnswer}</strong>
                      </Typography>
                    )}
                  </Alert>
                  <Button variant="contained" size="large" onClick={handleNextQuestion}>
                    {solveIndex >= questions.length - 1 ? t('quiz.finish') : t('quiz.next')}
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Box>
      )}

      {mainTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">{t('quiz.questionsHeading')}</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => openDialog()}>
              {t('quiz.addQuestion')}
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <QuizIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('quiz.noQuestions')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('quiz.addFirstQuestion')}
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openDialog()}>
                {t('quiz.addQuestion')}
              </Button>
            </Paper>
          ) : (
            questions.map((question, index) => (
              <Paper key={question.id} sx={{ mb: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#9C27B0',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      mr: 2,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1.05rem' }}>
                      {question.content}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                      <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
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
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingQuestion ? t('quiz.editQuestion') : t('quiz.newQuestion')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('quiz.questionContent')}
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label={t('quiz.correctAnswerLabel')}
            value={formAnswer}
            onChange={(e) => setFormAnswer(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('quiz.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formContent.trim() || !formAnswer.trim()}
          >
            {saving ? t('quiz.saving') : t('quiz.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteQuestionId !== null}
        title={t('quiz.deleteTitle')}
        message={t('quiz.deleteMessage')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteQuestionId(null)}
      />
    </>
  )
}
