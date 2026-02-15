import type {
  Activity,
  Article,
  CreateArticle,
  CreateExercise,
  CreateQuiz,
  Exercise,
  PaginationParams,
  Quiz,
  UpdateArticle,
  UpdateExercise,
  UpdateQuiz,
} from '../types/api'
import { apiClient } from './client'

// Generic activities
export function getActivities(params?: PaginationParams) {
  return apiClient.get<{ activities: Activity[] }>('/v1/activities', params)
}

export function getActivity(id: string) {
  return apiClient.get<{ activity: Activity }>(`/v1/activities/${id}`)
}

export function deleteActivity(id: string) {
  return apiClient.delete<void>(`/v1/activities/${id}`)
}

// Articles
export function createArticle(data: CreateArticle) {
  return apiClient.post<{ article: Article }>('/v1/articles', data)
}

export function updateArticle(id: string, data: UpdateArticle) {
  return apiClient.patch<{ article: Article }>(`/v1/articles/${id}`, data)
}

// Exercises
export function createExercise(data: CreateExercise) {
  return apiClient.post<{ exercise: Exercise }>('/v1/exercises', data)
}

export function updateExercise(id: string, data: UpdateExercise) {
  return apiClient.patch<{ exercise: Exercise }>(`/v1/exercises/${id}`, data)
}

// Quizzes
export function createQuiz(data: CreateQuiz) {
  return apiClient.post<{ quiz: Quiz }>('/v1/quizzes', data)
}

export function updateQuiz(id: string, data: UpdateQuiz) {
  return apiClient.patch<{ quiz: Quiz }>(`/v1/quizzes/${id}`, data)
}
