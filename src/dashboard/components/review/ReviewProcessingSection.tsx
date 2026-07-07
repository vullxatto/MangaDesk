import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { OverviewPipelineJob } from '../../pipelineTypes'
import { usePipeline } from '../../context/usePipeline'

function phaseLabel(phase: string, state: string) {
  if (state === 'failed') return 'Ошибка'
  if (state === 'completed') return 'Готово'
  if (phase === 'ocr') return 'OCR и перевод страниц'
  if (phase === 'queued') return 'В очереди'
  if (phase === 'done') return 'Завершение'
  return 'Обработка'
}

function jobProgress(job: OverviewPipelineJob) {
  const total = Math.max(1, job.total || 1)
  const done = Math.min(job.done, total)
  const pct =
    job.state === 'completed'
      ? 100
      : Math.round((done / total) * 100) || (job.state === 'running' ? 5 : 0)
  return { total, done, pct }
}

function ProcessingJobRow({
  job,
  onDismiss,
}: {
  job: OverviewPipelineJob
  onDismiss: (chapterId: string) => void
}) {
  const { total, done, pct } = jobProgress(job)

  return (
    <li className="review-processing-item">
      <div className="review-processing-row">
        <div className="review-queue-item-top">
          <span className="review-queue-name" title={job.fileLabel}>
            {job.fileLabel}
          </span>
          <div className="review-queue-item-top-meta">
            <button
              type="button"
              className="review-queue-remove"
              onClick={() => onDismiss(job.chapterId)}
            >
              Скрыть
            </button>
          </div>
        </div>
        {job.error ? (
          <p className="review-queue-field-error" role="alert">
            {job.error}
          </p>
        ) : null}
        <div
          className="review-processing-progress-track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="review-processing-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="review-processing-meta">
          <p className="review-processing-phase">{phaseLabel(job.phase, job.state)}</p>
          <p className="review-processing-counter">
            {job.total > 0 ? `Страница ${Math.min(done + 1, total)} из ${total}` : 'Подготовка…'}
          </p>
        </div>
      </div>
    </li>
  )
}

export default function ReviewProcessingSection({ pageSize = 4 }: { pageSize?: number }) {
  const { overviewJobs, dismissOverviewJob } = usePipeline()
  const [pageIndex, setPageIndex] = useState(0)

  const totalPages = Math.max(1, Math.ceil(overviewJobs.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const visibleJobs = useMemo(() => {
    const start = safePageIndex * pageSize
    return overviewJobs.slice(start, start + pageSize)
  }, [overviewJobs, pageSize, safePageIndex])

  useEffect(() => {
    setPageIndex((page) => Math.min(page, totalPages - 1))
  }, [totalPages])

  if (overviewJobs.length === 0) {
    return (
      <section className="review-section review-processing-section" aria-labelledby="review-processing-heading">
        <h2 id="review-processing-heading" className="review-section-title">
          Обработка
        </h2>
        <p className="review-dropzone-hint">
          После подтверждения в модальном окне здесь отображается прогресс OCR и перевода. Глава появится во
          вкладке «Главы», когда обработка завершится.
        </p>
      </section>
    )
  }

  return (
    <section className="review-section review-processing-section" aria-labelledby="review-processing-heading">
      <div className="review-queue-head">
        <h2 id="review-processing-heading" className="review-section-title review-queue-section-title">
          Обработка ({overviewJobs.length})
        </h2>
        <div className="review-queue-head-actions">
          {totalPages > 1 ? (
            <div className="review-assignments-pagination review-assignments-pagination--head">
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn"
                onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
                disabled={safePageIndex <= 0}
                aria-label="Предыдущая страница обработки"
              >
                <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
              </button>
              <span className="review-assignments-page-indicator">
                {safePageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="review-queue-clear chapters-page-pagination-btn"
                onClick={() => setPageIndex((page) => Math.min(totalPages - 1, page + 1))}
                disabled={safePageIndex >= totalPages - 1}
                aria-label="Следующая страница обработки"
              >
                <ChevronRight size={16} strokeWidth={1.8} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="article-mini-card review-processing-group">
        <ul className="review-processing-group-list">
          {visibleJobs.map((job) => (
            <ProcessingJobRow key={job.chapterId} job={job} onDismiss={dismissOverviewJob} />
          ))}
        </ul>
      </div>
    </section>
  )
}
