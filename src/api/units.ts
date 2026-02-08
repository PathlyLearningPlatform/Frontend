import type {
  CreateUnit,
  PaginationParams,
  Unit,
  UpdateUnit,
} from '../types/api'
import { apiClient } from './client'

const ENDPOINT = '/v1/units'

export function getUnits(params?: PaginationParams) {
  return apiClient.get<{ units: Unit[] }>(ENDPOINT, params)
}

export function getUnit(id: string) {
  return apiClient.get<{ unit: Unit }>(`${ENDPOINT}/${id}`)
}

export function createUnit(data: CreateUnit) {
  return apiClient.post<{ unit: Unit }>(ENDPOINT, data)
}

export function updateUnit(id: string, data: UpdateUnit) {
  return apiClient.patch<{ unit: Unit }>(`${ENDPOINT}/${id}`, data)
}

export function deleteUnit(id: string) {
  return apiClient.delete<{ unit: Unit }>(`${ENDPOINT}/${id}`)
}
