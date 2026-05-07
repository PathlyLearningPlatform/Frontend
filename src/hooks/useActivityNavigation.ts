// src/hooks/useActivityNavigation.ts
import { useLocation, useNavigate } from 'react-router-dom'
import type { Activity } from '../types/api'

interface ActivityNavigationState {
  activities?: Activity[]
  lessonId?: string
}

export function useActivityNavigation(currentActivityId: string | undefined) {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as ActivityNavigationState

  const activities: Activity[] = state.activities ?? []
  const lessonId: string | undefined = state.lessonId

  const currentIndex = activities.findIndex((a) => a.id === currentActivityId)

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex !== -1 && currentIndex < activities.length - 1
  const isLast = currentIndex === activities.length - 1 && currentIndex !== -1

  const buildUrl = (activity: Activity) =>
    `/activities/${(activity.type ?? 'article').toLowerCase()}/${activity.id}`

  const goNext = () => {
    if (!hasNext) return
    const next = activities[currentIndex + 1]
    navigate(buildUrl(next), { state })  // przekazujemy state dalej!
  }

  const goPrev = () => {
    if (!hasPrev) return
    const prev = activities[currentIndex - 1]
    navigate(buildUrl(prev), { state })  // przekazujemy state dalej!
  }

  const goToLesson = () => {
    if (lessonId) navigate(`/lessons/${lessonId}`)
    else navigate(-1)
  }

  return {
    activities,
    lessonId,
    currentIndex,
    totalCount: activities.length,
    hasPrev,
    hasNext,
    isLast,
    goNext,
    goPrev,
    goToLesson,
  }
}