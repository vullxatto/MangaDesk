import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
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
  const [page, setPage] = useState('chapters')
  const [isDark, setIsDark] = useState(() =>
    window.localStorage.getItem('dashboard-theme') === 'dark',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  function renderPage() {
    if (page === 'review') {
      return <ReviewPage />
    }

    if (page === 'tasks') {
      return <TasksPage />
    }

    if (page === 'projects') {
      return <ProjectsPage />
    }

    if (page === 'chapters') {
      return <ChaptersPage title={titleByPage(page)} />
    }

    if (page === 'team') {
      return <TeamPage />
    }

    if (page === 'statistics') {
      return <StatisticsPage />
    }

    return <SettingsPage />
  }

  return (
    <div className="dashboard-layout">
      <Sidebar menuItems={menuItems} activePage={page} onPageChange={setPage} />

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
