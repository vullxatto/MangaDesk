import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import {
  isDuplicateChapterNumber,
  MANGA_PROJECTS,
  TEAM_MEMBERS,
} from '../../context/pipelineConstants'
import { usePipeline } from '../../context/usePipeline'

function formatBytes(n) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isZip(file) {
  const name = file.name.toLowerCase()
  return name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed'
}

function itemCanSubmit(item, chapters, uploadQueue, processingJobs) {
  if (!item.projectId) return false
  const num = parseInt(String(item.chapterNumber).trim(), 10)
  if (!Number.isFinite(num) || num < 1) return false
  const project = MANGA_PROJECTS.find((p) => p.id === item.projectId)
  if (!project) return false
  return !isDuplicateChapterNumber(
    project.title,
    num,
    chapters,
    uploadQueue,
    processingJobs,
    item.id,
  )
}

function ReviewDropzone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const {
    chapters,
    uploadQueue,
    processingJobs,
    addZipToUploadQueue,
    updateUploadQueueItem,
    removeUploadQueueItem,
    clearUploadQueue,
    submitUploadQueueItem,
    soloMode,
  } = usePipeline()

  const addFiles = useCallback(
    (fileList) => {
      const next = Array.from(fileList).filter(isZip) as File[]
      if (next.length === 0) return
      addZipToUploadQueue(next)
    },
    [addZipToUploadQueue],
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
        aria-label="Зона загрузки архива ZIP: перетащите файл или нажмите для выбора"
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
          accept=".zip,application/zip,application/x-zip-compressed"
          multiple
          onChange={handleInputChange}
          aria-hidden
        />
        <Upload className="review-dropzone-icon" size={28} strokeWidth={1.8} aria-hidden />
        <p className="review-dropzone-text">
          Перетащите архив с сканами глав <strong>.zip</strong> сюда или выберите файл
        </p>
        <p className="review-dropzone-hint">Только ZIP, до 500 МБ на файл (демо, без отправки на сервер)</p>
      </div>

      {uploadQueue.length > 0 && (
        <div className="review-queue">
          <div className="review-queue-head">
            <span className="review-queue-label">В очереди на обработку ({uploadQueue.length})</span>
            <button type="button" className="review-queue-clear" onClick={clearUploadQueue}>
              Очистить
            </button>
          </div>
          <ul className="review-queue-list">
            {uploadQueue.map((item) => {
              const project = MANGA_PROJECTS.find((p) => p.id === item.projectId)
              const num = parseInt(String(item.chapterNumber).trim(), 10)
              const duplicate =
                project &&
                Number.isFinite(num) &&
                num >= 1 &&
                isDuplicateChapterNumber(
                  project.title,
                  num,
                  chapters,
                  uploadQueue,
                  processingJobs,
                  item.id,
                )
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
                <div className="review-queue-fields">
                  <label className="review-queue-field">
                    <span className="review-queue-field-label">Проект</span>
                    <select
                      className="review-queue-select"
                      value={item.projectId}
                      onChange={(e) =>
                        updateUploadQueueItem(item.id, { projectId: e.target.value })
                      }
                      required
                    >
                      <option value="">Выберите проект</option>
                      {MANGA_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="review-queue-field">
                    <span className="review-queue-field-label">Номер главы</span>
                    <input
                      type="number"
                      className={`review-queue-input${duplicate ? ' review-queue-input--invalid' : ''}`}
                      min={1}
                      step={1}
                      value={item.chapterNumber}
                      onChange={(e) =>
                        updateUploadQueueItem(item.id, { chapterNumber: e.target.value })
                      }
                      placeholder="—"
                      aria-invalid={duplicate}
                    />
                    {duplicate ? (
                      <p className="review-queue-field-error" role="alert">
                        Такой номер для этого проекта уже занят
                      </p>
                    ) : null}
                  </label>
                  {!soloMode ? (
                    <label className="review-queue-field">
                      <span className="review-queue-field-label">Редактор</span>
                      <select
                        className="review-queue-select"
                        value={item.editorId}
                        onChange={(e) =>
                          updateUploadQueueItem(item.id, { editorId: e.target.value })
                        }
                      >
                        <option value="">Не назначен</option>
                        {TEAM_MEMBERS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <div className="review-queue-submit-wrap">
                    <button
                      type="button"
                      className="dashboard-new-btn review-queue-submit"
                      disabled={!itemCanSubmit(item, chapters, uploadQueue, processingJobs)}
                      onClick={() => submitUploadQueueItem(item.id)}
                    >
                      <span>Отправить в обработку</span>
                    </button>
                  </div>
                </div>
              </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ReviewDropzone
