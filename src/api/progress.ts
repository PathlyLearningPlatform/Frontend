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
  return apiClient.patch(`${ENDPOINT}/learning-paths/${learningPathId}/start`)
}

export function startLesson(lessonId: string) {
  return apiClient.patch(`${ENDPOINT}/lessons/${lessonId}/start`)
}