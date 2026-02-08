import type {
  CreateLearningPath,
  LearningPath,
  LearningPathsParams,
  UpdateLearningPath,
} from '../types/api'
import { apiClient } from './client'

const ENDPOINT = '/v1/learning-paths'

export function getLearningPaths(params?: LearningPathsParams) {
  return apiClient.get<{ paths: LearningPath[] }>(ENDPOINT, params)
}

export function getLearningPath(id: string) {
  return apiClient.get<{ path: LearningPath }>(`${ENDPOINT}/${id}`)
}

export function createLearningPath(data: CreateLearningPath) {
  return apiClient.post<{ path: LearningPath }>(ENDPOINT, data)
}

export function updateLearningPath(id: string, data: UpdateLearningPath) {
  return apiClient.patch<{ path: LearningPath }>(`${ENDPOINT}/${id}`, data)
}

export function deleteLearningPath(id: string) {
  return apiClient.delete<{ path: LearningPath }>(`${ENDPOINT}/${id}`)
}
