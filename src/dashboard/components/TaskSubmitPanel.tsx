import { useCallback, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { usePipeline } from '../context/usePipeline'

function formatBytes(n: number) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isAllowedArchive(file: File) {
  const name = file.name.toLowerCase()
  return name.endsWith('.zip') || name.endsWith('.rar')
}

type TaskSubmitPanelProps = {
  chapterId: string
  reviewFeedback?: string | null
  onOpen: () => void
}

export default function TaskSubmitPanel({ chapterId, reviewFeedback, onOpen }: TaskSubmitPanelProps) {
  const { uploadTaskDeliverables, submitTaskForReview } = usePipeline()
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

  return (
    <>
      <div className="tasks-table-actions">
        <PressActionButton buttonClassName="review-queue-submit tasks-action-btn" onClick={onOpen}>
          <span>Открыть перевод</span>
        </PressActionButton>
      </div>

      <div className="task-submit-panel">
        {reviewFeedback ? (
          <blockquote className="task-submit-feedback">
            <span className="task-submit-feedback-label">Комментарий проверяющего:</span>
            {reviewFeedback}
          </blockquote>
        ) : null}

        <div className="task-submit-row">
          <div className="task-submit-main">
            {pendingFiles.length === 0 ? (
              <div
                className={`review-dropzone task-submit-dropzone${isDragging ? ' review-dropzone--active' : ''}${uploading ? ' task-submit-dropzone--disabled' : ''}`}
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
                onClick={() => {
                  if (!uploading) inputRef.current?.click()
                }}
                onKeyDown={(e) => {
                  if (uploading) return
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={uploading ? -1 : 0}
                aria-disabled={uploading}
              >
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
                <Upload className="review-dropzone-icon" size={18} strokeWidth={1.8} aria-hidden />
                <p className="review-dropzone-text">
                  Перетащите архив .zip или .rar с итоговой работой
                </p>
              </div>
            ) : null}

            {pendingFiles.length > 0 ? (
              <ul className="task-submit-files">
                {pendingFiles.map((f) => (
                  <li key={f.name}>
                    <span className="task-submit-file-name">
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
            ) : null}
          </div>

          <PressActionButton
            buttonClassName="review-queue-submit tasks-action-btn"
            disabled={!canSubmit || submitting || uploading}
            onClick={() => void handleSubmit()}
          >
            <span>{submitting ? 'Отправка…' : 'Отправить на проверку'}</span>
          </PressActionButton>
        </div>

        {error ? <p className="review-queue-field-error task-submit-error">{error}</p> : null}
      </div>
    </>
  )
}
