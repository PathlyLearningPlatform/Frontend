import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/DashboardPage'
import ExplorePage from './pages/ExplorePage'
import MyPathsPage from './pages/MyPathsPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LearningPathDetailPage from './pages/LearningPathDetailPage'
import UnitDetailPage from './pages/UnitDetailPage'
import LessonDetailPage from './pages/LessonDetailPage'
import QuizDetailPage from './pages/QuizDetailPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ExerciseDetailPage from './pages/ExerciseDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectsPage from './pages/ProjectsPage'
import SkillsPage from './pages/SkillsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/my-paths" element={<MyPathsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/learning-paths/:id" element={<LearningPathDetailPage />} />
          <Route path="/units/:unitId" element={<UnitDetailPage />} />
          <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="/activities/quiz/:activityId" element={<QuizDetailPage />} />
          <Route path="/activities/article/:activityId" element={<ArticleDetailPage />} />
          <Route path="/activities/exercise/:activityId" element={<ExerciseDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
