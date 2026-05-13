import { usePipeline } from '../../context/usePipeline'

function phaseLabel(phase: string, state: string) {
  if (state === 'failed') return 'Ошибка'
  if (state === 'completed') return 'Готово'
  if (phase === 'ocr') return 'OCR и перевод страниц'
  if (phase === 'queued') return 'В очереди'
  if (phase === 'done') return 'Завершение'
  return 'Обработка'
}

export default function ReviewProcessingSection() {
  const { overviewJob, dismissOverviewJob } = usePipeline()

  if (!overviewJob) {
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

  const total = Math.max(1, overviewJob.total || 1)
  const done = Math.min(overviewJob.done, total)
  const pct =
    overviewJob.state === 'completed'
      ? 100
      : Math.round((done / total) * 100) || (overviewJob.state === 'running' ? 5 : 0)

  return (
    <section className="review-section review-processing-section" aria-labelledby="review-processing-heading">
      <h2 id="review-processing-heading" className="review-section-title">
        Обработка
      </h2>
      <div className="review-pipeline-active">
        <p className="review-pipeline-file" title={overviewJob.fileLabel}>
          {overviewJob.fileLabel}
        </p>
        <p className="review-pipeline-phase">{phaseLabel(overviewJob.phase, overviewJob.state)}</p>
        {overviewJob.error ? (
          <p className="review-queue-field-error" role="alert">
            {overviewJob.error}
          </p>
        ) : null}
        <div className="review-pipeline-bar-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="review-pipeline-bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="review-pipeline-meta">
          {overviewJob.total > 0
            ? `Страница ${Math.min(done + 1, total)} из ${total}`
            : 'Подготовка…'}
        </p>
        <button type="button" className="review-pipeline-dismiss" onClick={() => dismissOverviewJob()}>
          Скрыть панель
        </button>
      </div>
    </section>
  )
}
