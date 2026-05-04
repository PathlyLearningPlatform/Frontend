import type { LearningPathProgress, LessonProgress } from '../types/api'
import { apiClient } from './client'

const ENDPOINT = '/v1/progress'

export function getLearningPathsProgress() {
  return apiClient.get<{ learningPathProgress: LearningPathProgress[] }>(`${ENDPOINT}/learning-paths`)
}

export function getLessonProgress() {
  return apiClient.get<{ lessonProgress: LessonProgress[] }>(`${ENDPOINT}/lessons`)
}

export function startLearningPath(learningPathId: string) {
  return apiClient.patch(`${ENDPOINT}/learning-paths/${learningPathId}/start`, {})
}

export function startLesson(lessonId: string) {
  return apiClient.patch(`${ENDPOINT}/lessons/${lessonId}/start`, {})
}

export function completeActivity(activityId: string) {
  return apiClient.patch(`${ENDPOINT}/activities/${activityId}/complete`, {})
}

export function getSkillsGraph(parentSkillId?: string) {
  const params = parentSkillId ? `?parentSkillId=${parentSkillId}` : ''
  return apiClient.get<{ graph: { nodes: { id: string; name: string; slug: string }[]; edges: { fromId: string; toId: string; type: string }[] } }>(`/v1/skills/prerequisite-graph${params}`)
}