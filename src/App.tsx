import { Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { ArticlesPage } from './pages/ArticlesPage'
import { AuthProvider } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { ExamplesPage } from './pages/ExamplesPage'
import { HomePage } from './pages/HomePage'
import ChaptersPage from './dashboard/components/ChaptersPage'
import AccountPage from './dashboard/components/pages/AccountPage'
import ChapterEditorPage from './dashboard/components/pages/ChapterEditorPage'
import GlossaryPage from './dashboard/components/pages/GlossaryPage'
import ProjectsPage from './dashboard/components/pages/ProjectsPage'
import ReviewPage from './dashboard/components/pages/ReviewPage'
import SettingsPage from './dashboard/components/pages/SettingsPage'
import StatisticsPage from './dashboard/components/pages/StatisticsPage'
import TasksPage from './dashboard/components/pages/TasksPage'
import TeamPage from './dashboard/components/pages/TeamPage'
import { PipelineProvider } from './dashboard/context/PipelineContext'
import DashboardLayout from './dashboard/DashboardLayout'
import { dashboardTitleByPage } from './dashboard/dashboardMenu'
import { ProtectedRoute } from './dashboard/ProtectedRoute'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/examples" element={<ExamplesPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthProvider>
              <PipelineProvider>
                <DashboardLayout />
              </PipelineProvider>
            </AuthProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="review" replace />} />
        <Route path="review" element={<ReviewPage title={dashboardTitleByPage('review')} />} />
        <Route path="tasks" element={<TasksPage title={dashboardTitleByPage('tasks')} />} />
        <Route path="projects" element={<ProjectsPage title={dashboardTitleByPage('projects')} />} />
        <Route path="projects/:projectId/glossary" element={<GlossaryPage />} />
        <Route path="chapters" element={<ChaptersPage title={dashboardTitleByPage('chapters')} />} />
        <Route path="chapters/:chapterId/edit" element={<ChapterEditorPage />} />
        <Route path="team" element={<TeamPage title={dashboardTitleByPage('team')} />} />
        <Route path="account" element={<AccountPage title={dashboardTitleByPage('account')} />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="settings" element={<SettingsPage title={dashboardTitleByPage('settings')} />} />
      </Route>
    </Routes>
    </>
  )
}
