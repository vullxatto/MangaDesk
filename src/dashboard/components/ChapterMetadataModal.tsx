import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { isDuplicateChapterNumber } from '../context/pipelineConstants'
import type { ChapterRow, DashboardProject, TeamMember, UploadQueueItem } from '../pipelineTypes'
import DashboardDropdown from './DashboardDropdown'

export default function ChapterMetadataModal({
  initialProjectId,
  initialNumber,
  initialEditorId,
  chapterId,
  projects,
  chapters,
  uploadQueue,
  teamMembers,
  soloMode,
  onClose,
  onConfirm,
  onDelete,
}: {
  initialProjectId: string
  initialNumber: number
  initialEditorId: string | null
  chapterId: string
  projects: DashboardProject[]
  chapters: ChapterRow[]
  uploadQueue: UploadQueueItem[]
  teamMembers: TeamMember[]
  soloMode: boolean
  onClose: () => void
  onConfirm: (
    projectId: string,
    number: number,
    chapterTitle?: string | null,
    editorId?: string | null,
  ) => void
  onDelete: () => void
}) {
  const titleId = useId()
  const [projectId, setProjectId] = useState(
    () => projects.find((p) => p.id === initialProjectId)?.id ?? projects[0]?.id ?? '',
  )
  const [chapterNum, setChapterNum] = useState(String(initialNumber))
  const [editorId, setEditorId] = useState(initialEditorId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)

  useBodyScrollLock(true)

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.title })),
    [projects],
  )

  const editorOptions = useMemo(
    () => [
      { value: '', label: 'Не назначен' },
      ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
    ],
    [teamMembers],
  )

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (!openDropdownKey) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(openDropdownKey)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(openDropdownKey)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setOpenDropdownKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (openDropdownKey) {
        setOpenDropdownKey(null)
        return
      }
      onClose()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openDropdownKey, onClose])

  function handleConfirm() {
    const num = parseInt(String(chapterNum).trim(), 10)
    if (!projectId) {
      setError('Выберите проект')
      return
    }
    if (!Number.isFinite(num) || num < 1) {
      setError('Укажите номер главы не меньше 1')
      return
    }
    if (isDuplicateChapterNumber(projectId, num, chapters, uploadQueue, '', chapterId)) {
      setError('Такой номер для этого проекта уже занят')
      return
    }
    setError(null)
    onConfirm(projectId, num, null, soloMode ? undefined : editorId)
    onClose()
  }

  return createPortal(
    <div className="team-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="team-modal project-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <h2 id={titleId} className="team-modal-title">
            Изменить проект и номер главы
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="project-form-body">
          <div className="project-form-field review-queue-field">
            <DashboardDropdown
              label="Проект"
              options={projectOptions}
              value={projectId}
              onChange={(value) => {
                setProjectId(value)
                setError(null)
              }}
              ddKey="chapter-meta|project"
              openKey={openDropdownKey}
              onOpenChange={setOpenDropdownKey}
            />
          </div>
          <div className="project-form-field review-queue-field">
            <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
              <span className="dashboard-filter-btn-text">
                <span className="dashboard-filter-btn-label">Номер главы:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="review-queue-chapter-input project-form-name-input"
                  value={chapterNum}
                  onChange={(e) => {
                    setChapterNum(e.target.value.replace(/\D/g, ''))
                    setError(null)
                  }}
                  placeholder="—"
                  aria-label="Номер главы"
                />
              </span>
            </label>
          </div>
          {!soloMode ? (
            <div className="project-form-field review-queue-field">
              <DashboardDropdown
                label="Редактор"
                options={editorOptions}
                value={editorId}
                onChange={(value) => {
                  setEditorId(value)
                  setError(null)
                }}
                ddKey="chapter-meta|editor"
                openKey={openDropdownKey}
                onOpenChange={setOpenDropdownKey}
              />
            </div>
          ) : null}
          {error ? (
            <p className="review-queue-field-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="project-form-footer">
          <PressActionButton wrapClassName="project-form-delete-btn" onClick={onDelete}>
            <span>Удалить</span>
          </PressActionButton>
          <PressActionButton onClick={onClose}>
            <span>Отмена</span>
          </PressActionButton>
          <PressActionButton onClick={handleConfirm}>
            <span>Подтвердить</span>
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
