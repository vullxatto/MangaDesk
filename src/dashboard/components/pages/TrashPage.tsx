import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPostJson } from '../../../lib/api'
import { usePipeline } from '../../context/usePipeline'

type TrashProject = {
  id: string
  title: string
  deleted_at: string
}

type TrashChapter = {
  id: string
  project_id: string
  project_title: string
  chapter_number: number
  chapter_title: string | null
  deleted_at: string
}

type TrashResponse = {
  projects: TrashProject[]
  chapters: TrashChapter[]
}

export default function TrashPage({ title = 'Корзина' }: { title?: string }) {
  const { refreshDashboard } = usePipeline()
  const [items, setItems] = useState<TrashResponse>({ projects: [], chapters: [] })
  const [loading, setLoading] = useState(true)
  const [restoreProjectId, setRestoreProjectId] = useState<string | null>(null)

  const loadTrash = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<TrashResponse>('/trash')
      setItems(data)
    } catch (e) {
      console.error(e)
      setItems({ projects: [], chapters: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTrash()
  }, [loadTrash])

  async function restoreChapter(id: string) {
    try {
      await apiPostJson(`/chapters/${id}/restore`, {})
      await Promise.all([loadTrash(), refreshDashboard()])
    } catch (e) {
      console.error(e)
    }
  }

  async function restoreProject(id: string, withChapters: boolean) {
    try {
      await apiPostJson(`/projects/${id}/restore`, { restore_chapters: withChapters })
      setRestoreProjectId(null)
      await Promise.all([loadTrash(), refreshDashboard()])
    } catch (e) {
      console.error(e)
    }
  }

  const selectedProject = items.projects.find((p) => p.id === restoreProjectId) ?? null
  const isEmpty = !loading && items.projects.length === 0 && items.chapters.length === 0

  return (
    <div className="chapters-page projects-page settings-page">
      <div className="dashboard-toolbar projects-page-toolbar">
        <h1>{title}</h1>
      </div>
      <div className="chapters-panel settings-panel">
        {loading ? <p className="account-muted">Загрузка корзины...</p> : null}
        {/* Ошибки корзины намеренно не показываем в UI по запросу */}

        {isEmpty ? <p className="trash-empty-text">В корзине пусто</p> : null}

        {!isEmpty ? (
          <>
            <section className="account-card">
              <h2>Удаленные проекты</h2>
              {items.projects.length === 0 ? (
                <p className="account-muted">Пусто</p>
              ) : (
                <div className="trash-list">
                  {items.projects.map((p) => (
                    <div key={p.id} className="trash-item">
                      <div>
                        <div className="dashboard-user-name">{p.title}</div>
                        <div className="account-muted">Удалено: {new Date(p.deleted_at).toLocaleString('ru-RU')}</div>
                      </div>
                      <button type="button" className="dashboard-new-btn" onClick={() => setRestoreProjectId(p.id)}>
                        Восстановить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="account-card">
              <h2>Удаленные главы</h2>
              {items.chapters.length === 0 ? (
                <p className="account-muted">Пусто</p>
              ) : (
                <div className="trash-list">
                  {items.chapters.map((c) => (
                    <div key={c.id} className="trash-item">
                      <div>
                        <div className="dashboard-user-name">
                          {c.project_title} · Глава № {c.chapter_number}
                        </div>
                        <div className="account-muted">Удалено: {new Date(c.deleted_at).toLocaleString('ru-RU')}</div>
                      </div>
                      <button type="button" className="dashboard-new-btn" onClick={() => void restoreChapter(c.id)}>
                        Восстановить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>

      {selectedProject ? (
        <div className="team-modal-backdrop" role="presentation" onClick={() => setRestoreProjectId(null)}>
          <div className="team-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="team-modal-header">
              <h2 className="team-modal-title">Восстановление проекта</h2>
            </div>
            <div className="project-form-body">
              <p>Восстановить главы, привязанные к проекту?</p>
            </div>
            <div className="project-form-footer">
              <button
                type="button"
                className="dashboard-reset-btn"
                onClick={() => void restoreProject(selectedProject.id, false)}
              >
                Нет
              </button>
              <button
                type="button"
                className="dashboard-new-btn"
                onClick={() => void restoreProject(selectedProject.id, true)}
              >
                Да
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
