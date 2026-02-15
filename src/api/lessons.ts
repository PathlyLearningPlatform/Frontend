import type {
  CreateLesson,
  Lesson,
  PaginationParams,
  UpdateLesson,
} from '../types/api'
import { apiClient } from './client'

const ENDPOINT = '/v1/lessons'

export function getLessons(params?: PaginationParams) {
  return apiClient.get<{ lessons: Lesson[] }>(ENDPOINT, params)
}

export function getLesson(id: string) {
  return apiClient.get<{ lesson: Lesson }>(`${ENDPOINT}/${id}`)
}

export function createLesson(data: CreateLesson) {
  return apiClient.post<{ lesson: Lesson }>(ENDPOINT, data)
}

export function updateLesson(id: string, data: UpdateLesson) {
  return apiClient.patch<{ lesson: Lesson }>(`${ENDPOINT}/${id}`, data)
}

export function deleteLesson(id: string) {
  return apiClient.delete<void>(`${ENDPOINT}/${id}`)
}
