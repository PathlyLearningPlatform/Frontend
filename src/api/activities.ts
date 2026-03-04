import type {
  Activity,
  Article,
  CreateArticle,
  CreateExercise,
  CreateQuiz,
  CreateQuestion,
  Exercise,
  PaginationParams,
  Question,
  Quiz,
  UpdateArticle,
  UpdateExercise,
  UpdateQuiz,
  UpdateQuestion,
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

// Questions
export function getQuestions(quizId: string) {
  return apiClient.get<{ questions: Question[] }>(`/v1/quizzes/${quizId}/questions`)
}

export function createQuestion(quizId: string, data: CreateQuestion) {
  return apiClient.post<{ question: Question }>(`/v1/quizzes/${quizId}/questions`, data)
}

export function updateQuestion(quizId: string, questionId: string, data: UpdateQuestion) {
  return apiClient.patch<{ question: Question }>(`/v1/quizzes/${quizId}/questions/${questionId}`, data)
}

export function deleteQuestion(quizId: string, questionId: string) {
  return apiClient.delete<void>(`/v1/quizzes/${quizId}/questions/${questionId}`)
}
