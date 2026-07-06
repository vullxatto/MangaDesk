import { useCallback, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { PressActionButton } from '../../components/PressActionButton'
import { usePipeline } from '../context/usePipeline'

function formatBytes(n: number) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isAllowedDeliverable(file: File) {
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.zip') ||
    name.endsWith('.rar') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.psd')
  )
}

type TaskSubmitPanelProps = {
  chapterId: string
  reviewFeedback?: string | null
}

export default function TaskSubmitPanel({ chapterId, reviewFeedback }: TaskSubmitPanelProps) {
  const { uploadTaskDeliverables, submitTaskForReview } = usePipeline()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const next = Array.from(fileList).filter(isAllowedDeliverable)
    if (next.length === 0) {
      setError('Допустимы архивы .zip / .rar, изображения и .psd')
      return
    }
    setError(null)
    setPendingFiles((prev) => {
      const names = new Set(prev.map((f) => f.name))
      return [...prev, ...next.filter((f) => !names.has(f.name))]
    })
    setUploaded(false)
  }, [])

  const removeFile = (name: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== name))
    setUploaded(false)
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return
    setUploading(true)
    setError(null)
    try {
      await uploadTaskDeliverables(chapterId, pendingFiles)
      setUploaded(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
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

  return (
    <div className="task-submit-panel">
      {reviewFeedback ? (
        <blockquote className="task-submit-feedback">
          <span className="task-submit-feedback-label">Комментарий проверяющего</span>
          {reviewFeedback}
        </blockquote>
      ) : null}

      <div
        className={`review-dropzone task-submit-dropzone${isDragging ? ' review-dropzone--active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="review-dropzone-input"
          accept=".zip,.rar,.png,.jpg,.jpeg,.webp,.psd"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Upload className="review-dropzone-icon" size={22} strokeWidth={1.8} aria-hidden />
        <p className="review-dropzone-text">
          Перетащите архив .zip / .rar, изображения или PSD с итоговой работой
        </p>
      </div>

      {pendingFiles.length > 0 ? (
        <ul className="task-submit-files">
          {pendingFiles.map((f) => (
            <li key={f.name}>
              <span>
                {f.name} · {formatBytes(f.size)}
                {uploaded ? ' · загружено' : ''}
              </span>
              <button
                type="button"
                className="review-queue-clear task-submit-file-remove"
                onClick={() => removeFile(f.name)}
                aria-label={`Убрать ${f.name}`}
              >
                <X size={14} strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="review-queue-field-error">{error}</p> : null}

      <div className="task-submit-actions">
        {pendingFiles.length > 0 && !uploaded ? (
          <PressActionButton
            buttonClassName="review-queue-submit"
            disabled={uploading}
            onClick={() => void handleUpload()}
          >
            <span>{uploading ? 'Загрузка…' : 'Загрузить'}</span>
          </PressActionButton>
        ) : null}
        <PressActionButton
          buttonClassName="review-queue-submit"
          disabled={submitting || uploading}
          onClick={() => void handleSubmit()}
        >
          <span>{submitting ? 'Отправка…' : 'Отправить'}</span>
        </PressActionButton>
      </div>
    </div>
  )
}
