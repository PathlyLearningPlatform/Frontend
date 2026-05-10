import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { DetailSkeleton } from '../components/PageSkeleton'
import Alert from '@mui/material/Alert'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import LinearProgress from '@mui/material/LinearProgress'
import QuizIcon from '@mui/icons-material/Quiz'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getLesson, getQuestions, createQuestion, updateQuestion, deleteQuestion, completeActivity } from '../api'
import type { Activity, Lesson, Question } from '../types/api'
import { useSnackbar } from '../context/SnackbarContext'
import { useLanguage } from '../context/LanguageContext'
import { answersMatch, markActivityCompleted } from '../lib/activityProgress'
import { useActivityNavigation } from '../hooks/useActivityNavigation' 
import ActivityNavBar from '../components/ActivityNavBar'                

export default function QuizDetailPage() {
  const { activityId } = useParams()
  const navigate = useNavigate()
  const { showSnackbar } = useSnackbar()
  const { t } = useLanguage()

  const { currentIndex, totalCount, hasPrev, hasNext, isLast, goNext, goPrev, goToLesson } =
    useActivityNavigation(activityId)

  const [quiz, setQuiz] = useState<Activity | null>(null)
  const [parentLesson, setParentLesson] = useState<Lesson | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch { /* fallback */ }
    } catch {
      setError(t('error.fetchQuiz' as any) || 'Nie udało się pobrać danych quizu.')
    } finally {
      setLoading(false)
    }
  }, [activityId, t])

  useEffect(() => { fetchData() }, [fetchData])

  const resetSolveMode = () => {
    setSolveIndex(0)
    setUserAnswer('')
    setChecked(false)
    setLastCorrect(null)
    setCorrectCount(0)
    setSolveFinished(false)
  }

  useEffect(() => { resetSolveMode() }, [activityId])

  const currentQuestion = questions[solveIndex]
  const solveProgress = questions.length > 0 ? ((solveIndex + (checked ? 1 : 0)) / questions.length) * 100 : 0

  const handleCheckAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return
    const ok = answersMatch(userAnswer, currentQuestion.correctAnswer)
    setLastCorrect(ok)
    setChecked(true)
    if (ok) setCorrectCount((c) => c + 1)
  }

  const handleNextQuestion = async () => {
    if (solveIndex >= questions.length - 1) {
      setSolveFinished(true)
      if (quiz) {
        try {
          await completeActivity(quiz.id)
          markActivityCompleted(quiz.lessonId, quiz.id)
          showSnackbar(t('quiz.markedComplete' as any) || 'Quiz ukończony!')
        } catch {
          showSnackbar(t('error.saveProgress' as any) || 'Nie udało się zapisać postępu', 'error')
        }
      }
      return
    }
    setSolveIndex((i) => i + 1)
    setUserAnswer('')
    setChecked(false)
    setLastCorrect(null)
  }

  if (loading) return <DetailSkeleton />
  if (!quiz) return <Alert severity="error">{t('error.notFound' as any) || 'Nie znaleziono quizu.'}</Alert>

  return (
    <>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          {t('nav.dashboard' as any)}
        </Link>
        {parentLesson && (
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={goToLesson}>
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

      <Paper sx={{ p: 4, mb: 2, background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <QuizIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{quiz.name}</Typography>
          <Chip label={t('exercise.quiz' as any) || 'Quiz'} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
        </Box>
        {quiz.description && (
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 720 }}>{quiz.description}</Typography>
        )}
        <Chip
          label={t('quiz.questionCount' as any, { count: questions.length }) || `${questions.length} pytań`}
          sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Paper>

      <Box>
        {questions.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('quiz.noQuestionsSolve' as any) || 'Brak pytań.'}</Typography>
          </Paper>
        ) : solveFinished ? (
          <Paper sx={{ p: 4, maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>{t('quiz.summaryTitle' as any) || 'Koniec quizu!'}</Typography>
            <Typography variant="h4" sx={{ my: 2, fontWeight: 800, color: 'primary.main' }}>
              {correctCount} / {questions.length}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>{t('quiz.summaryHint' as any) || 'Dobra robota!'}</Typography>
            <Button variant="outlined" size="large" onClick={resetSolveMode} sx={{ mr: 2 }}>
              {t('quiz.restart' as any) || 'Spróbuj ponownie'}
            </Button>

            <ActivityNavBar
              currentIndex={currentIndex}
              totalCount={totalCount}
              hasPrev={hasPrev}
              hasNext={hasNext}
              isLast={isLast}
              onPrev={goPrev}
              onNext={goNext}
              onGoToLesson={goToLesson}
              requireCompletion={false}
              isCompleted={true}
            />
          </Paper>
        ) : (
          <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, maxWidth: 800, mx: 'auto', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  {t('quiz.questionProgress' as any, { current: solveIndex + 1, total: questions.length }) || `Pytanie ${solveIndex + 1} z ${questions.length}`}
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

            <Typography component="h2" variant="h5" sx={{ fontWeight: 700, mb: 3, lineHeight: 1.4, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {currentQuestion?.content}
            </Typography>

            <TextField
              fullWidth
              label={t('quiz.yourAnswer' as any) || 'Twoja odpowiedź'}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={checked}
              multiline
              minRows={2}
              sx={{ mb: 2 }}
              placeholder={t('quiz.answerPlaceholder' as any) || 'Wpisz odpowiedź...'}
            />

            {!checked ? (
              <Button variant="contained" size="large" onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>
                {t('quiz.check' as any) || 'Sprawdź'}
              </Button>
            ) : (
              <Box>
                <Alert severity={lastCorrect ? 'success' : 'error'} icon={lastCorrect ? <CheckCircleIcon /> : <CancelIcon />} sx={{ mb: 2 }}>
                  <Typography fontWeight={700}>{lastCorrect ? t('quiz.correct' as any) : t('quiz.incorrect' as any)}</Typography>
                  {!lastCorrect && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {t('quiz.expectedAnswer' as any) || 'Poprawna odpowiedź'}: <strong>{currentQuestion?.correctAnswer}</strong>
                    </Typography>
                  )}
                </Alert>
                <Button variant="contained" size="large" onClick={handleNextQuestion}>
                  {solveIndex >= questions.length - 1 ? (t('quiz.finish' as any) || 'Zakończ') : (t('quiz.next' as any) || 'Dalej')}
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </>
  )
}