import type {
  CreateSection,
  PaginationParams,
  Section,
  UpdateSection,
} from '../types/api'
import { apiClient } from './client'

const ENDPOINT = '/v1/sections'

export function getSections(params?: PaginationParams) {
  return apiClient.get<{ sections: Section[] }>(ENDPOINT, params)
}

export function getSection(id: string) {
  return apiClient.get<{ section: Section }>(`${ENDPOINT}/${id}`)
}

export function createSection(data: CreateSection) {
  return apiClient.post<{ section: Section }>(ENDPOINT, data)
}

export function updateSection(id: string, data: UpdateSection) {
  return apiClient.patch<{ section: Section }>(`${ENDPOINT}/${id}`, data)
}

export function deleteSection(id: string) {
  return apiClient.delete<{ section: Section }>(`${ENDPOINT}/${id}`)
}
