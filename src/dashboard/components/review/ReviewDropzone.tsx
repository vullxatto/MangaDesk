import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookPlus, Upload, UserPlus, X } from 'lucide-react'
import { PressActionButton } from '../../../components/PressActionButton'
import { useAuth } from '../../../context/AuthContext'
import { isDuplicateChapterNumber } from '../../context/pipelineConstants'
import { usePipeline } from '../../context/usePipeline'
import { apiPostJson, apiPostMultipart } from '../../../lib/api'
import DashboardDropdown, { type DashboardDropdownOption } from '../DashboardDropdown'
import ProjectFormModal from '../ProjectFormModal'
import TeamInviteModal from '../TeamInviteModal'

function formatBytes(n) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isAllowedUpload(file: File) {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.zip') ||
    name.endsWith('.rar') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.psd') ||
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.type === 'application/x-rar-compressed'
  )
}

type QueueOption = DashboardDropdownOption

type ArchiveEstimate = {
  image_count: number
  tokens_required: number
  tokens_per_image: number
}

function ProcessingSubmitModal({
  fileName,
  cleanSounds,
  typeSounds,
  onCleanSoundsChange,
  onTypeSoundsChange,
  estimate,
  estimateLoading,
  estimateError,
  onClose,
  onConfirm,
}: {
  fileName: string
  cleanSounds: boolean
  typeSounds: boolean
  onCleanSoundsChange: (v: boolean) => void
  onTypeSoundsChange: (v: boolean) => void
  estimate: ArchiveEstimate | null
  estimateLoading: boolean
  estimateError: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const total = estimate?.tokens_required ?? 0
  const optionTokenCosts = useMemo(
    () => ({
      clean: Math.floor(Math.random() * 15) + 1,
      type: Math.floor(Math.random() * 15) + 1,
    }),
    [fileName],
  )

  return createPortal(
    <div
      className="team-modal-backdrop review-submit-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="team-modal review-submit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-submit-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="team-modal-header">
          <div>
            <h2 id="review-submit-modal-title" className="review-aside-title">
              Параметры обработки
            </h2>
            <p className="review-submit-modal-sub">{fileName}</p>
          </div>
          <button type="button" className="team-modal-close" aria-label="Закрыть" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="review-submit-modal-body">
          <label className="review-submit-modal-row">
            <input
              type="checkbox"
              className="review-submit-modal-checkbox"
              checked={cleanSounds}
              onChange={(e) => onCleanSoundsChange(e.target.checked)}
            />
            <span className="review-submit-modal-label">Клинить звуки?</span>
            <span className="review-submit-modal-row-tokens" aria-live="polite">
              {optionTokenCosts.clean} ток.
            </span>
          </label>
          <label className="review-submit-modal-row">
            <input
              type="checkbox"
              className="review-submit-modal-checkbox"
              checked={typeSounds}
              onChange={(e) => onTypeSoundsChange(e.target.checked)}
            />
            <span className="review-submit-modal-label">Тайпить звуки?</span>
            <span className="review-submit-modal-row-tokens" aria-live="polite">
              {optionTokenCosts.type} ток.
            </span>
          </label>
        </div>
        <div className="review-submit-modal-footer">
          {estimateLoading ? <p className="review-submit-modal-sub">Считаем токены...</p> : null}
          {estimateError ? (
            <p className="review-queue-field-error" role="alert">
              {estimateError}
            </p>
          ) : null}
          {estimate ? (
            <p className="review-submit-modal-sub">
              Изображений в архиве: {estimate.image_count} · {estimate.tokens_per_image} токена за изображение
            </p>
          ) : null}
          <p className="review-submit-modal-total">
            Всего: <strong>{total}</strong> токенов
          </p>
          <PressActionButton
            buttonClassName="review-queue-submit"
            onClick={onConfirm}
            disabled={estimateLoading || !!estimateError}
          >
            <span>Отправить в обработку</span>
          </PressActionButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function itemCanSubmit(
  item: { projectId: string; chapterNumber: string; id: string },
  chapters: import('../../pipelineTypes').ChapterRow[],
  uploadQueue: { id: string; projectId: string; chapterNumber: string }[],
  projects: { id: string }[],
) {
  if (!item.projectId) return false
  const num = parseInt(String(item.chapterNumber).trim(), 10)
  if (!Number.isFinite(num) || num < 1) return false
  const project = projects.find((p) => p.id === item.projectId)
  if (!project) return false
  return !isDuplicateChapterNumber(item.projectId, num, chapters, uploadQueue, item.id)
}

function ReviewDropzone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [openQueueDropdownKey, setOpenQueueDropdownKey] = useState<string | null>(null)
  const [submitModalItemId, setSubmitModalItemId] = useState<string | null>(null)
  const [modalCleanSounds, setModalCleanSounds] = useState(false)
  const [modalTypeSounds, setModalTypeSounds] = useState(false)
  const [archiveEstimate, setArchiveEstimate] = useState<ArchiveEstimate | null>(null)
  const [archiveEstimateLoading, setArchiveEstimateLoading] = useState(false)
  const [archiveEstimateError, setArchiveEstimateError] = useState<string | null>(null)
  const [addProjectOpen, setAddProjectOpen] = useState(false)
  const [addProjectForQueueItemId, setAddProjectForQueueItemId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const { teams, currentTeamId } = useAuth()
  const {
    chapters,
    uploadQueue,
    projects,
    teamMembers,
    addFilesToUploadQueue,
    updateUploadQueueItem,
    removeUploadQueueItem,
    clearUploadQueue,
    submitUploadQueueItem,
    soloMode,
  } = usePipeline()

  const isPersonalTeam = useMemo(() => {
    const team = teams.find((t) => t.id === currentTeamId)
    return !!team?.is_personal
  }, [teams, currentTeamId])

  async function openInviteMemberModal() {
    try {
      const res = await apiPostJson<{ invite_url: string }>('/team/invites', {})
      setInviteLink(res.invite_url)
      setInviteOpen(true)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!submitModalItemId) return
    if (!uploadQueue.some((q) => q.id === submitModalItemId)) {
      setSubmitModalItemId(null)
    }
  }, [submitModalItemId, uploadQueue])

  useEffect(() => {
    if (!openQueueDropdownKey) return

    function handleMouseDown(e: MouseEvent) {
      const k = openQueueDropdownKey
      if (!k) return
      const t = e.target as Node
      const trigger = document.querySelector(`[data-review-queue-dd="${CSS.escape(k)}"]`)
      const portalMenu = document.querySelector(`[data-review-queue-portal="${CSS.escape(k)}"]`)
      if (trigger?.contains(t) || portalMenu?.contains(t)) return
      setOpenQueueDropdownKey(null)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenQueueDropdownKey(null)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openQueueDropdownKey])

  const projectOptions: QueueOption[] = [
    { value: '', label: 'Выберите проект' },
    ...projects.map((p) => ({ value: p.id, label: p.title })),
  ]

  const editorOptions: QueueOption[] = [
    { value: '', label: 'Не назначен' },
    ...teamMembers.map((m) => ({ value: m.id, label: m.name })),
  ]

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const next = Array.from(fileList).filter(isAllowedUpload)
      if (next.length === 0) return
      addFilesToUploadQueue(next)
    },
    [addFilesToUploadQueue],
  )

  function handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) setIsDragging(false)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function handleInputChange(e) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const submitModalItem = submitModalItemId
    ? uploadQueue.find((q) => q.id === submitModalItemId) ?? null
    : null

  function openSubmitModal(itemId: string) {
    setModalCleanSounds(false)
    setModalTypeSounds(false)
    setSubmitModalItemId(itemId)
    setArchiveEstimate(null)
    setArchiveEstimateError(null)
    setArchiveEstimateLoading(false)
  }

  function closeSubmitModal() {
    setSubmitModalItemId(null)
  }

  function confirmSubmitFromModal() {
    if (!submitModalItemId) return
    const id = submitModalItemId
    setSubmitModalItemId(null)
    void submitUploadQueueItem(id)
  }

  useEffect(() => {
    if (!submitModalItem) return
    const lower = submitModalItem.file.name.toLowerCase()
    if (!(lower.endsWith('.zip') || lower.endsWith('.rar'))) {
      setArchiveEstimate({ image_count: 0, tokens_required: 0, tokens_per_image: 0 })
      setArchiveEstimateError(null)
      setArchiveEstimateLoading(false)
      return
    }
    const fd = new FormData()
    fd.append('file', submitModalItem.file)
    setArchiveEstimateLoading(true)
    setArchiveEstimateError(null)
    setArchiveEstimate(null)
    void apiPostMultipart('/chapters/archive/estimate', fd)
      .then((res) => {
        const dto = res as ArchiveEstimate
        if (
          !dto ||
          typeof dto.image_count !== 'number' ||
          typeof dto.tokens_required !== 'number' ||
          typeof dto.tokens_per_image !== 'number'
        ) {
          throw new Error('Неверный ответ API при расчёте токенов')
        }
        setArchiveEstimate(dto)
      })
      .catch((e) => {
        setArchiveEstimateError(e instanceof Error ? e.message : 'Не удалось посчитать токены')
      })
      .finally(() => {
        setArchiveEstimateLoading(false)
      })
  }, [submitModalItem])

  return (
    <section className="review-section" aria-labelledby="review-upload-heading">
      <h2 id="review-upload-heading" className="review-section-title">
        Загрузка сканов
      </h2>
      <div
        className={`review-dropzone ${isDragging ? 'review-dropzone--active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Зона загрузки: ZIP, RAR, PNG, PSD — перетащите файлы или нажмите для выбора"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="review-dropzone-input"
          accept=".zip,.rar,.png,.jpg,.jpeg,.webp,.psd,application/zip,application/x-zip-compressed,application/x-rar-compressed"
          multiple
          onChange={handleInputChange}
          aria-hidden
        />
        <Upload className="review-dropzone-icon" size={28} strokeWidth={1.8} aria-hidden />
        <p className="review-dropzone-text">
          Перетащите сюда архив <strong>.zip</strong> / <strong>.rar</strong> или отдельные файлы{' '}
          <strong>.png</strong> / <strong>.psd</strong> (и др. изображения)
        </p>
        <p className="review-dropzone-hint">
          После подтверждения в модальном окне файл уходит на сервер; OCR и перевод запускаются сразу, прогресс — ниже в
          блоке «Обработка». Глава появится во вкладке «Главы», когда всё будет готово.
        </p>
      </div>

      {uploadQueue.length > 0 && (
        <div className="review-section review-queue-section">
          <div className="review-queue-head">
            <p className="review-section-title review-queue-section-title">
              В очереди на обработку ({uploadQueue.length})
            </p>
            <button type="button" className="review-queue-clear" onClick={clearUploadQueue}>
              Очистить
            </button>
          </div>
          <div className="article-mini-card review-queue-group">
            <ul className="review-queue-group-list">
            {uploadQueue.map((item) => {
              const project = projects.find((p) => p.id === item.projectId)
              const num = parseInt(String(item.chapterNumber).trim(), 10)
              const duplicate =
                project &&
                Number.isFinite(num) &&
                num >= 1 &&
                isDuplicateChapterNumber(item.projectId, num, chapters, uploadQueue, item.id)
              return (
              <li key={item.id} className="review-queue-item review-queue-item--form">
                <div className="review-queue-item-top">
                  <span className="review-queue-name">{item.file.name}</span>
                  <div className="review-queue-item-top-meta">
                    <span className="review-queue-size">{formatBytes(item.file.size)}</span>
                    <button
                      type="button"
                      className="review-queue-remove"
                      onClick={() => removeUploadQueueItem(item.id)}
                    >
                      Убрать
                    </button>
                  </div>
                </div>
                <div
                  className={`review-queue-fields${soloMode ? ' review-queue-fields--solo' : ''}`}
                >
                  <div className="review-queue-field">
                    <DashboardDropdown
                      label="Проект"
                      options={projectOptions}
                      value={item.projectId}
                      onChange={(v) => updateUploadQueueItem(item.id, { projectId: v })}
                      ddKey={`${item.id}|project`}
                      openKey={openQueueDropdownKey}
                      onOpenChange={setOpenQueueDropdownKey}
                      footerAction={{
                        label: 'Добавить проект',
                        icon: <BookPlus size={12} strokeWidth={2.5} aria-hidden />,
                        onClick: () => {
                          setAddProjectForQueueItemId(item.id)
                          setAddProjectOpen(true)
                        },
                      }}
                    />
                  </div>
                  <div className="review-queue-field">
                    <label
                      className={`dashboard-filter-btn review-queue-chapter-cell${duplicate ? ' review-queue-chapter-cell--invalid' : ''}`}
                    >
                      <span className="dashboard-filter-btn-text">
                        <span className="dashboard-filter-btn-label">Номер главы:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="review-queue-chapter-input"
                          value={item.chapterNumber}
                          onChange={(e) => {
                            const next = e.target.value.replace(/\D/g, '')
                            updateUploadQueueItem(item.id, { chapterNumber: next })
                          }}
                          placeholder="—"
                          aria-invalid={duplicate}
                          aria-label="Номер главы"
                        />
                      </span>
                    </label>
                    {duplicate ? (
                      <p className="review-queue-field-error" role="alert">
                        Такой номер для этого проекта уже занят
                      </p>
                    ) : null}
                  </div>
                  {!soloMode ? (
                    <div className="review-queue-field">
                      <DashboardDropdown
                        label="Редактор"
                        options={editorOptions}
                        value={item.editorId}
                        onChange={(v) => updateUploadQueueItem(item.id, { editorId: v })}
                        ddKey={`${item.id}|editor`}
                        openKey={openQueueDropdownKey}
                        onOpenChange={setOpenQueueDropdownKey}
                        footerAction={
                          isPersonalTeam
                            ? undefined
                            : {
                                label: 'Добавить участника',
                                icon: <UserPlus size={12} strokeWidth={2.5} aria-hidden />,
                                onClick: () => void openInviteMemberModal(),
                              }
                        }
                      />
                    </div>
                  ) : null}
                  <div className="review-queue-submit-wrap">
                    <PressActionButton
                      buttonClassName="review-queue-submit"
                      disabled={!itemCanSubmit(item, chapters, uploadQueue, projects)}
                      onClick={() => openSubmitModal(item.id)}
                    >
                      <span>Отправить в обработку</span>
                    </PressActionButton>
                  </div>
                </div>
              </li>
              )
            })}
            </ul>
          </div>
        </div>
      )}
      {submitModalItem ? (
        <ProcessingSubmitModal
          fileName={submitModalItem.file.name}
          cleanSounds={modalCleanSounds}
          typeSounds={modalTypeSounds}
          onCleanSoundsChange={setModalCleanSounds}
          onTypeSoundsChange={setModalTypeSounds}
          estimate={archiveEstimate}
          estimateLoading={archiveEstimateLoading}
          estimateError={archiveEstimateError}
          onClose={closeSubmitModal}
          onConfirm={confirmSubmitFromModal}
        />
      ) : null}
      <ProjectFormModal
        open={addProjectOpen}
        mode="add"
        onClose={() => {
          setAddProjectOpen(false)
          setAddProjectForQueueItemId(null)
        }}
        onCreated={(projectId) => {
          if (addProjectForQueueItemId) {
            updateUploadQueueItem(addProjectForQueueItemId, { projectId })
          }
          setAddProjectOpen(false)
          setAddProjectForQueueItemId(null)
        }}
      />
      <TeamInviteModal
        open={inviteOpen}
        inviteLink={inviteLink}
        onClose={() => setInviteOpen(false)}
      />
    </section>
  )
}

export default ReviewDropzone
