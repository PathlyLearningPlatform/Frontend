export interface LearningPath {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  learningPathId: string
  name: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Unit {
  id: string
  sectionId: string
  name: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  message: string
  timestamp: string
  details: unknown | null
}

export interface PaginationParams {
  limit?: number
  page?: number
}

export interface LearningPathsParams extends PaginationParams {
  sortType?: 'ASC' | 'DESC'
  orderBy?: 'NAME' | 'CREATED_AT' | 'UPDATED_AT'
}

export interface CreateLearningPath {
  name: string
  description?: string
}

export interface UpdateLearningPath {
  name?: string
  description?: string
}

export interface CreateSection {
  name: string
  description?: string
  order: number
  learningPathId: string
}

export interface UpdateSection {
  name?: string
  description?: string
  order?: number
}

export interface CreateUnit {
  name: string
  description?: string
  order: number
  sectionId: string
}

export interface UpdateUnit {
  name?: string
  description?: string
  order?: number
}
