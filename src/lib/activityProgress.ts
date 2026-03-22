/**
 * Lokalne śledzenie ukończonych aktywności w ramach lekcji.
 * Gdy backend udostępni endpointy postępu, można tu podmienić implementację
 * (np. sync z API + merge z localStorage).
 */
const storageKey = (lessonId: string) => `pathly-lesson-progress:${lessonId}`

export const ACTIVITY_PROGRESS_EVENT = 'pathly-activity-progress'

export function getCompletedActivityIds(lessonId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(lessonId))
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as unknown
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr.filter((id): id is string => typeof id === 'string'))
  } catch {
    return new Set()
  }
}

export function isActivityCompleted(lessonId: string, activityId: string): boolean {
  return getCompletedActivityIds(lessonId).has(activityId)
}

export function markActivityCompleted(lessonId: string, activityId: string): void {
  const set = getCompletedActivityIds(lessonId)
  set.add(activityId)
  localStorage.setItem(storageKey(lessonId), JSON.stringify([...set]))
  window.dispatchEvent(
    new CustomEvent(ACTIVITY_PROGRESS_EVENT, { detail: { lessonId } }),
  )
}

export function lessonCompletionRatio(lessonId: string, totalActivities: number): number {
  if (totalActivities <= 0) return 0
  const n = getCompletedActivityIds(lessonId).size
  return Math.min(100, Math.round((n / totalActivities) * 100))
}

export function subscribeLessonProgress(lessonId: string, onUpdate: () => void): () => void {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<{ lessonId?: string }>
    if (ce.detail?.lessonId === lessonId) onUpdate()
  }
  window.addEventListener(ACTIVITY_PROGRESS_EVENT, handler)
  return () => window.removeEventListener(ACTIVITY_PROGRESS_EVENT, handler)
}

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function answersMatch(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
}
