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

// Lessons
export interface Lesson {
  id: string
  unitId: string
  name: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateLesson {
  name: string
  description?: string
  order: number
  unitId: string
}

export interface UpdateLesson {
  name?: string
  description?: string
  order?: number
}

// Activities
export type ActivityType = 'article' | 'exercise' | 'quiz'
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard'

export interface Activity {
  id: string
  lessonId: string
  name: string
  description: string | null
  order: number
  type: ActivityType
  createdAt: string
  updatedAt: string | null
}

export interface Article extends Activity {
  type: 'article'
  ref: string
}

export interface Exercise extends Activity {
  type: 'exercise'
  difficulty: ExerciseDifficulty
}

export interface Quiz extends Activity {
  type: 'quiz'
}

export interface CreateArticle {
  name: string
  description?: string
  order: number
  lessonId: string
  ref: string
}

export interface UpdateArticle {
  name?: string
  description?: string
  order?: number
  ref?: string
}

export interface CreateExercise {
  name: string
  description?: string
  order: number
  lessonId: string
  difficulty: ExerciseDifficulty
}

export interface UpdateExercise {
  name?: string
  description?: string
  order?: number
  difficulty?: ExerciseDifficulty
}

export interface CreateQuiz {
  name: string
  description?: string
  order: number
  lessonId: string
}

export interface UpdateQuiz {
  name?: string
  description?: string
  order?: number
}

// Questions
export interface Question {
  id: string
  quizId: string
  order: number
  content: string
  correctAnswer: string
}

export interface CreateQuestion {
  content: string
  correctAnswer: string
}

export interface UpdateQuestion {
  content?: string
  correctAnswer?: string
}
