import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { usePipeline } from '../../context/usePipeline'
import type { GlossaryEntry } from '../../glossary/glossaryTypes'
import { AddGlossaryEntryModal } from '../AddGlossaryEntryModal'

export default function GlossaryPage() {
  const { projectId: projectIdParam } = useParams<{ projectId: string }>()
  const location = useLocation()
  const {
    projects,
    glossaryByProjectId,
    loadGlossaryForProject,
    removeGlossaryEntry,
    addGlossaryEntry,
    updateGlossaryEntry,
  } = usePipeline()

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const project = useMemo(
    () => (projectIdParam ? projects.find((p) => p.id === projectIdParam) : undefined),
    [projectIdParam, projects],
  )

  const [addOpen, setAddOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<GlossaryEntry | null>(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (!projectIdParam) return
    void loadGlossaryForProject(projectIdParam)
  }, [projectIdParam, loadGlossaryForProject])

  if (!projectIdParam || !project) {
    return <Navigate to="/dashboard/projects" replace />
  }

  const entries = glossaryByProjectId[projectIdParam] ?? []

  const backHref = returnTo && returnTo.startsWith('/dashboard/') ? returnTo : '/dashboard/projects'
  const backLabel = returnTo ? '← К переводу' : '← К проектам'

  return (
    <div className="chapters-page projects-page glossary-page">
      <div className="dashboard-toolbar projects-page-toolbar glossary-page-toolbar">
        <div className="glossary-page-heading">
          <Link to={backHref} className="chapter-editor-back glossary-page-back">
            {backLabel}
          </Link>
          <h1>
            <BookOpen className="glossary-page-title-icon" size={22} strokeWidth={2} aria-hidden />
            Глоссарий: {project.title}
          </h1>
        </div>
        <button
          type="button"
          className="dashboard-new-btn"
          onClick={() => {
            setFormKey((n) => n + 1)
            setEditingEntry(null)
            setAddOpen(true)
          }}
        >
          <Plus className="projects-add-project-plus" size={18} strokeWidth={2.5} aria-hidden />
          <span>Добавить термин</span>
        </button>
      </div>

      <div className="chapters-panel">
        <div className="glossary-table">
          <div className="glossary-table-row glossary-table-row--head">
            <span>Оригинал</span>
            <span>Перевод</span>
            <span className="glossary-table-actions-head" aria-hidden />
          </div>
          {entries.length === 0 ? (
            <div className="glossary-table-empty">
              <p className="glossary-empty">Пока нет терминов. Добавьте вручную или из редактора главы.</p>
            </div>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="glossary-table-row">
                <span className="glossary-table-cell glossary-table-cell--source">{e.source}</span>
                <span className="glossary-table-cell glossary-table-cell--target">{e.target}</span>
                <span className="glossary-table-actions">
                  <button
                    type="button"
                    className="glossary-table-edit"
                    aria-label="Редактировать термин"
                    onClick={() => {
                      setFormKey((n) => n + 1)
                      setEditingEntry(e)
                      setAddOpen(true)
                    }}
                  >
                    <Pencil size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="glossary-table-delete"
                    aria-label="Удалить термин"
                    onClick={() => void removeGlossaryEntry(projectIdParam, e.id)}
                  >
                    <Trash2 size={16} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <AddGlossaryEntryModal
        key={formKey}
        open={addOpen}
        mode={editingEntry ? 'edit' : 'add'}
        projectLabel={project.title}
        initialSource={editingEntry?.source ?? ''}
        initialTarget={editingEntry?.target ?? ''}
        onClose={() => {
          setAddOpen(false)
          setEditingEntry(null)
        }}
        onSubmit={(source, target) => {
          if (editingEntry) {
            void updateGlossaryEntry(projectIdParam, editingEntry.id, { source, target })
          } else {
            void addGlossaryEntry(projectIdParam, { source, target })
          }
        }}
      />
    </div>
  )
}
