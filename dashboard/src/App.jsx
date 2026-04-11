import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { usePipeline } from './context/PipelineContext'
import ChaptersPage from './components/ChaptersPage'
import ProjectsPage from './components/pages/ProjectsPage'
import ReviewPage from './components/pages/ReviewPage'
import SettingsPage from './components/pages/SettingsPage'
import StatisticsPage from './components/pages/StatisticsPage'
import TasksPage from './components/pages/TasksPage'
import TeamPage from './components/pages/TeamPage'
import Sidebar from './components/Sidebar'
import './dashboard.css'

const menuItems = [
  { key: 'review', label: 'Обзор' },
  { key: 'tasks', label: 'Задачи' },
  { key: 'projects', label: 'Проекты' },
  { key: 'chapters', label: 'Главы' },
  { key: 'team', label: 'Команда' },
  { key: 'statistics', label: 'Статистика' },
  { key: 'settings', label: 'Настройки' },
]

function titleByPage(page) {
  return menuItems.find((item) => item.key === page)?.label ?? 'Кабинет'
}

function App() {
  const { soloMode } = usePipeline()
  const [page, setPage] = useState('review')
  const [isDark, setIsDark] = useState(() =>
    window.localStorage.getItem('dashboard-theme') === 'dark',
  )

  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => item.key !== 'tasks' || !soloMode),
    [soloMode],
  )

  const resolvedPage = soloMode && page === 'tasks' ? 'review' : page

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  function renderPage() {
    if (resolvedPage === 'review') {
      return <ReviewPage title={titleByPage('review')} />
    }

    if (resolvedPage === 'tasks') {
      return <TasksPage title={titleByPage('tasks')} />
    }

    if (resolvedPage === 'projects') {
      return <ProjectsPage title={titleByPage('projects')} />
    }

    if (resolvedPage === 'chapters') {
      return <ChaptersPage title={titleByPage('chapters')} />
    }

    if (resolvedPage === 'team') {
      return <TeamPage title={titleByPage('team')} />
    }

    if (resolvedPage === 'statistics') {
      return <StatisticsPage />
    }

    return <SettingsPage title={titleByPage('settings')} />
  }

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={visibleMenuItems} activePage={resolvedPage} onPageChange={setPage} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button
            type="button"
            className="dashboard-theme-btn"
            aria-label="Сменить тему"
            onClick={() => setIsDark((value) => !value)}
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </header>

        <section className="dashboard-content">{renderPage()}</section>
      </main>
    </div>
  )
}

export default App
