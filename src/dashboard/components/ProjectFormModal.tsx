import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import DashboardDropdown, { type DashboardDropdownOption } from './DashboardDropdown'
import { usePipeline } from '../context/usePipeline'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import {
  EMPTY_PROJECT_LINKS,
  normalizeProjectLinks,
  setProjectLinks,
  type ProjectLink,
} from '../projectLinks'

const sourceLangOptions: DashboardDropdownOption[] = [
  { value: 'jp', label: 'Японский' },
  { value: 'en', label: 'Английский' },
  { value: 'kr', label: 'Корейский' },
  { value: 'cn', label: 'Китайский' },
]

const targetLangOptions: DashboardDropdownOption[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'Английский' },
]

type ProjectFormModalProps = {
  open: boolean
  mode: 'add' | 'edit'
  projectId?: string
  initialName?: string
  initialLinks?: ProjectLink[]
  onDelete?: () => void
  onClose: () => void
  onCreated?: (projectId: string) => void
  onSaved?: () => void
}

export default function ProjectFormModal({
  open,
  mode,
  projectId,
  initialName = '',
  initialLinks = EMPTY_PROJECT_LINKS,
  onDelete,
  onClose,
  onCreated,
  onSaved,
}: ProjectFormModalProps) {
  const { createProject, updateProject } = usePipeline()
  const titleId = useId()
  const [name, setName] = useState(initialName)
  const [sourceLang, setSourceLang] = useState('jp')
  const [targetLang, setTargetLang] = useState('ru')
  const [links, setLinks] = useState<ProjectLink[]>(initialLinks)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useBodyScrollLock(open)

  const updateScrollHint = useCallback(() => {
    const el = bodyRef.current
    if (!el || links.length < 3) {
      setShowScrollHint(false)
      return
    }
    const hasOverflow = el.scrollHeight > el.clientHeight + 1
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
    setShowScrollHint(hasOverflow && !atBottom)
  }, [links.length])

  useEffect(() => {
    if (!open) return
    setName(initialName)
    setLinks(initialLinks.length > 0 ? initialLinks.map((link) => ({ ...link })) : [{ label: '', href: '' }])
    setError(null)
    setOpenDropdownKey(null)
  }, [open, initialName, initialLinks])

  useEffect(() => {
    if (!open) return undefined

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
  }, [open, openDropdownKey, onClose])

  useEffect(() => {
    if (!open) return undefined
    const frame = window.requestAnimationFrame(updateScrollHint)
    const el = bodyRef.current
    const ro = el ? new ResizeObserver(() => updateScrollHint()) : null
    if (el && ro) ro.observe(el)
    window.addEventListener('resize', updateScrollHint)
    return () => {
      window.cancelAnimationFrame(frame)
      ro?.disconnect()
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [open, links, updateScrollHint])

  if (!open) return null

  function updateLink(index: number, field: keyof ProjectLink, value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  function addLinkRow() {
    setLinks((prev) => [...prev, { label: '', href: '' }])
  }

  function removeLinkRow(index: number) {
    setLinks((prev) => (prev.length <= 1 ? [{ label: '', href: '' }] : prev.filter((_, i) => i !== index)))
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Введите название')
      return
    }
    const cleanedLinks = normalizeProjectLinks(links)
    setSaving(true)
    setError(null)
    try {
      if (mode === 'add') {
        const created = await createProject({
          title: trimmed,
          description: null,
          source_language: sourceLang,
          target_language: targetLang,
        })
        setProjectLinks(created.id, cleanedLinks)
        onCreated?.(created.id)
      } else if (projectId) {
        await updateProject(projectId, {
          title: trimmed,
          source_language: sourceLang,
          target_language: targetLang,
        })
        setProjectLinks(projectId, cleanedLinks)
      }
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
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
            {mode === 'add' ? 'Добавить проект' : 'Редактировать проект'}
          </h2>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div
          className={`project-form-body-wrap${showScrollHint ? ' project-form-body-wrap--scroll-hint' : ''}`}
        >
          <div
            ref={bodyRef}
            className="project-form-body"
            onScroll={updateScrollHint}
          >
          <div className="project-form-field review-queue-field">
            <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
              <span className="dashboard-filter-btn-text">
                <span className="dashboard-filter-btn-label">Название проекта:</span>
                <input
                  type="text"
                  className="review-queue-chapter-input project-form-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="—"
                  aria-label="Название проекта"
                />
              </span>
            </label>
          </div>
          <div className="project-form-field review-queue-field">
            <DashboardDropdown
              label="Язык оригинала"
              options={sourceLangOptions}
              value={sourceLang}
              onChange={setSourceLang}
              ddKey="project-form|source-lang"
              openKey={openDropdownKey}
              onOpenChange={setOpenDropdownKey}
            />
          </div>
          <div className="project-form-field review-queue-field">
            <DashboardDropdown
              label="Язык перевода"
              options={targetLangOptions}
              value={targetLang}
              onChange={setTargetLang}
              ddKey="project-form|target-lang"
              openKey={openDropdownKey}
              onOpenChange={setOpenDropdownKey}
            />
          </div>
          <div className="project-form-links">
            <div className="project-form-links-head">
              <span>Ссылки</span>
              <button type="button" className="review-queue-clear project-form-links-add" onClick={addLinkRow}>
                Добавить
              </button>
            </div>
            {links.map((link, index) => (
              <div key={index} className="project-form-link-row">
                <div className="project-form-link-fields">
                  <div className="project-form-field review-queue-field">
                    <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
                      <span className="dashboard-filter-btn-text">
                        <span className="dashboard-filter-btn-label">Название:</span>
                        <input
                          type="text"
                          className="review-queue-chapter-input project-form-name-input"
                          value={link.label}
                          onChange={(e) => updateLink(index, 'label', e.target.value)}
                          placeholder="—"
                          aria-label={`Название ссылки ${index + 1}`}
                        />
                      </span>
                    </label>
                  </div>
                  <div className="project-form-field review-queue-field">
                    <label className="dashboard-filter-btn review-queue-chapter-cell project-form-name-cell">
                      <span className="dashboard-filter-btn-text">
                        <span className="dashboard-filter-btn-label">URL:</span>
                        <input
                          type="url"
                          className="review-queue-chapter-input project-form-name-input"
                          value={link.href}
                          onChange={(e) => updateLink(index, 'href', e.target.value)}
                          placeholder="—"
                          aria-label={`URL ссылки ${index + 1}`}
                        />
                      </span>
                    </label>
                  </div>
                </div>
              <button type="button" className="review-queue-remove project-form-link-remove" onClick={() => removeLinkRow(index)}>
                Убрать
              </button>
              </div>
            ))}
          </div>
          {error ? (
            <p className="review-queue-field-error" role="alert">
              {error}
            </p>
          ) : null}
          </div>
          {showScrollHint ? (
            <div className="project-form-scroll-hint" aria-hidden>
              <ChevronDown size={20} strokeWidth={2.25} />
            </div>
          ) : null}
        </div>
        <div className="project-form-footer">
          {mode === 'edit' ? (
            <PressActionButton wrapClassName="project-form-delete-btn" onClick={onDelete} disabled={saving}>
              <span>Удалить</span>
            </PressActionButton>
          ) : null}
          <PressActionButton onClick={onClose} disabled={saving}>
            <span>Отмена</span>
          </PressActionButton>
          <PressActionButton onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
