import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Check, CloudDownload, RotateCcw, Upload, X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { usePipeline } from '../context/usePipeline'
import type { ChapterStatusCode } from '../pipelineTypes'

function formatBytes(n: number) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isAllowedArchive(file: File) {
  const name = file.name.toLowerCase()
  return name.endsWith('.zip') || name.endsWith('.rar')
}

const UPLOAD_TIP = 'Перетащите архив .zip или .rar с итоговой работой'

type TaskSubmitPanelProps = {
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  statusCode: ChapterStatusCode
  reviewFeedback?: string | null
  canModerateReview?: boolean
  reviewBusyId?: string | null
  onRejectChapter?: () => void
  onApproveChapter?: () => void
  gridTemplate: string
  renderCells: () => ReactNode
}

export default function TaskSubmitPanel({
  chapterId,
  chapterTitle,
  chapterNumber,
  statusCode,
  reviewFeedback,
  canModerateReview = false,
  reviewBusyId = null,
  onRejectChapter,
  onApproveChapter,
  gridTemplate,
  renderCells,
}: TaskSubmitPanelProps) {
  const { uploadTaskDeliverables, submitTaskForReview, downloadChapterDeliverables } = usePipeline()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stageAndUploadFile = useCallback(
    async (fileList: FileList | File[]) => {
      if (uploading || pendingFiles.length > 0) return

      const file = Array.from(fileList).find(isAllowedArchive)
      if (!file) {
        setError('Допустимен только один архив .zip или .rar')
        return
      }

      setError(null)
      setPendingFiles([file])
      setUploaded(false)
      setUploading(true)
      try {
        await uploadTaskDeliverables(chapterId, [file])
        setUploaded(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        setUploading(false)
      }
    },
    [chapterId, pendingFiles.length, uploadTaskDeliverables, uploading],
  )

  const removeFile = (name: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== name))
    setUploaded(false)
    setError(null)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      if (pendingFiles.length > 0 && !uploaded) {
        await uploadTaskDeliverables(chapterId, pendingFiles)
        setUploaded(true)
      }
      await submitTaskForReview(chapterId)
      setPendingFiles([])
      setUploaded(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка отправки')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = pendingFiles.length > 0 && uploaded
  const awaitingReview = statusCode === 'review'
  const showSubmitControls = !awaitingReview

  const rowStyle = { gridTemplateColumns: gridTemplate }

  return (
    <div className="tasks-table-row">
      <div className="chapters-row chapters-row--tasks" style={rowStyle}>
        {renderCells()}
        <span className="chapters-actions">
          {awaitingReview ? (
            <span className="tasks-review-actions review-assignments-actions chapters-actions">
              <button
                type="button"
                className="review-queue-clear"
                aria-label={`Скачать главу ${chapterTitle}, № ${chapterNumber}`}
                title="Скачать"
                onClick={() => void downloadChapterDeliverables(chapterId)}
              >
                <CloudDownload size={16} strokeWidth={1.8} aria-hidden />
              </button>
              {canModerateReview ? (
                <>
                  <button
                    type="button"
                    className="review-queue-clear chapters-review-approve"
                    aria-label={`Принять главу ${chapterTitle}, № ${chapterNumber}`}
                    title="Принять"
                    disabled={reviewBusyId === chapterId}
                    onClick={onApproveChapter}
                  >
                    <Check size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="review-queue-clear chapters-review-reject"
                    aria-label={`Вернуть главу редактору ${chapterTitle}, № ${chapterNumber}`}
                    title="Вернуть редактору"
                    disabled={reviewBusyId === chapterId}
                    onClick={onRejectChapter}
                  >
                    <RotateCcw size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                </>
              ) : null}
            </span>
          ) : showSubmitControls ? (
            <div className="tasks-action-col-tools">
              {pendingFiles.length === 0 ? (
                <div
                  className={`task-upload-btn-wrap${isDragging ? ' task-upload-btn-wrap--active' : ''}${uploading ? ' task-upload-btn-wrap--disabled' : ''}`}
                  onDragOver={(e) => {
                    if (uploading) return
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (uploading) return
                    if (e.dataTransfer.files.length > 0) void stageAndUploadFile(e.dataTransfer.files)
                  }}
                >
                  <button
                    type="button"
                    className="review-queue-clear"
                    onClick={() => {
                      if (!uploading) inputRef.current?.click()
                    }}
                    disabled={uploading}
                    aria-label={UPLOAD_TIP}
                    title={UPLOAD_TIP}
                  >
                    <Upload size={16} strokeWidth={1.8} aria-hidden />
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    disabled={uploading}
                    className="review-dropzone-input"
                    accept=".zip,.rar,application/zip,application/vnd.rar,application/x-rar-compressed"
                    onChange={(e) => {
                      if (e.target.files?.length) void stageAndUploadFile(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </div>
              ) : (
                <ul className="task-submit-files">
                  {pendingFiles.map((f) => (
                    <li key={f.name}>
                      <span className="task-submit-file-name" title={f.name}>
                        {f.name} · {formatBytes(f.size)}
                        {uploading ? ' · загрузка…' : uploaded ? ' · загружено' : ''}
                      </span>
                      <button
                        type="button"
                        className="task-submit-file-remove"
                        onClick={() => removeFile(f.name)}
                        disabled={uploading}
                        aria-label={`Убрать ${f.name}`}
                      >
                        <X size={14} strokeWidth={2} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <PressActionButton
                buttonClassName="review-queue-submit tasks-action-btn"
                disabled={!canSubmit || submitting || uploading}
                onClick={() => void handleSubmit()}
              >
                <span>{submitting ? 'Отправка…' : 'Отправить на проверку'}</span>
              </PressActionButton>
            </div>
          ) : null}
        </span>
      </div>

      {reviewFeedback ? (
        <blockquote className="task-submit-feedback">
          <span className="task-submit-feedback-label">Комментарий проверяющего:</span>
          {reviewFeedback}
        </blockquote>
      ) : null}

      {error ? <p className="review-queue-field-error task-submit-error">{error}</p> : null}
    </div>
  )
}
