import { useCallback, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

function formatBytes(n) {
  if (n < 1024) return `${n} Б`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`
  return `${(n / (1024 * 1024)).toFixed(1)} МБ`
}

function isZip(file) {
  const name = file.name.toLowerCase()
  return name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed'
}

function ReviewDropzone({ files, onFilesChange }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = useCallback(
    (fileList) => {
      const next = Array.from(fileList).filter(isZip)
      if (next.length === 0) return
      onFilesChange((prev) => {
        const seen = new Set(prev.map((f) => `${f.name}-${f.size}`))
        const merged = [...prev]
        for (const f of next) {
          const key = `${f.name}-${f.size}`
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(f)
          }
        }
        return merged
      })
    },
    [onFilesChange],
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

  function clearQueue() {
    onFilesChange([])
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

      {files.length > 0 && (
        <div className="review-queue">
          <div className="review-queue-head">
            <span className="review-queue-label">В очереди на обработку ({files.length})</span>
            <button type="button" className="review-queue-clear" onClick={clearQueue}>
              Очистить
            </button>
          </div>
          <ul className="review-queue-list">
            {files.map((f) => (
              <li key={`${f.name}-${f.size}`} className="review-queue-item">
                <span className="review-queue-name">{f.name}</span>
                <span className="review-queue-size">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ReviewDropzone
